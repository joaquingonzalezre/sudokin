// Declaramos que 'cv' existe en el objeto global
declare global {
  interface Window {
    cv: any;
  }
}

/**
 * CARGADOR BLINDADO (Anti-Bloqueos de Promesas)
 */
const loadOpenCV = async (): Promise<void> => {
  // <--- Ya no devolvemos 'any', devolvemos 'void'
  return new Promise((resolve, reject) => {
    // Si ya existe y tiene la función Mat, estamos listos.
    if (window.cv && window.cv.Mat) {
      return resolve(); // <--- Resolvemos VACÍO para evitar la trampa de Emscripten
    }

    if (document.getElementById("opencv-script")) {
      const check = setInterval(() => {
        if (window.cv && window.cv.Mat) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      return;
    }

    console.log("⬇️ Descargando motor de Visión Computacional...");
    const script = document.createElement("script");
    script.id = "opencv-script";
    script.src = "https://docs.opencv.org/4.8.0/opencv.js";
    script.async = true;

    script.onload = () => {
      const checkReady = setInterval(() => {
        if (window.cv && window.cv.Mat) {
          clearInterval(checkReady);
          console.log("✅ OpenCV listo para usarse.");
          resolve(); // <--- Resolvemos VACÍO
        }
      }, 100);
    };

    script.onerror = () => reject("Fallo crítico al descargar OpenCV.");
    document.body.appendChild(script);
  });
};

/**
 * HERRAMIENTA 1: VISIÓN COMPUTACIONAL
 */
export const findAndCropSudokuGrid = async (file: File): Promise<string> => {
  // 1. Esperamos a que cargue, pero SIN atrapar el objeto.
  await loadOpenCV();
  // 2. Lo obtenemos de forma segura del objeto global window.
  const cv = window.cv;

  return new Promise((resolve, reject) => {
    const processingTimeout = setTimeout(() => {
      reject(
        "Se agotó el tiempo procesando la imagen. Intenta con una foto menos pesada.",
      );
    }, 12000);

    // USAMOS FILEREADER: Es 100% más confiable en Next.js que URL.createObjectURL
    const reader = new FileReader();

    reader.onload = (e) => {
      const imgElement = new Image();

      imgElement.onload = () => {
        console.log("📸 Imagen cargada en HTML. Iniciando matemática...");

        setTimeout(() => {
          try {
            console.log("⚙️ 1. Redimensionando...");
            const MAX_WIDTH = 1000;
            let scale = 1;
            if (imgElement.width > MAX_WIDTH)
              scale = MAX_WIDTH / imgElement.width;

            const processCanvas = document.createElement("canvas");
            processCanvas.width = imgElement.width * scale;
            processCanvas.height = imgElement.height * scale;
            const pCtx = processCanvas.getContext("2d");
            pCtx?.drawImage(
              imgElement,
              0,
              0,
              processCanvas.width,
              processCanvas.height,
            );

            console.log("⚙️ 2. Convirtiendo a B/N...");
            let src = cv.imread(processCanvas);
            let gray = new cv.Mat();
            let blurred = new cv.Mat();
            let thresholded = new cv.Mat();

            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
            cv.GaussianBlur(gray, blurred, new cv.Size(7, 7), 0);
            cv.adaptiveThreshold(
              blurred,
              thresholded,
              255,
              cv.ADAPTIVE_THRESH_GAUSSIAN_C,
              cv.THRESH_BINARY_INV,
              11,
              2,
            );

            console.log("⚙️ 3. Buscando el Sudoku...");
            let contours = new cv.MatVector();
            let hierarchy = new cv.Mat();
            cv.findContours(
              thresholded,
              contours,
              hierarchy,
              cv.RETR_EXTERNAL,
              cv.CHAIN_APPROX_SIMPLE,
            );

            let maxArea = 0;
            let bestContour: any = null;
            const minAreaThreshold = src.rows * src.cols * 0.1;

            for (let i = 0; i < contours.size(); ++i) {
              let contour = contours.get(i);
              let area = cv.contourArea(contour);

              if (area > minAreaThreshold && area > maxArea) {
                let perimeter = cv.arcLength(contour, true);
                let approx = new cv.Mat();
                cv.approxPolyDP(contour, approx, 0.02 * perimeter, true);

                if (approx.rows === 4 && cv.isContourConvex(approx)) {
                  maxArea = area;
                  if (bestContour) bestContour.delete();
                  bestContour = approx;
                } else {
                  approx.delete();
                }
              }
              contour.delete();
            }

            if (!bestContour) {
              src.delete();
              gray.delete();
              blurred.delete();
              thresholded.delete();
              contours.delete();
              hierarchy.delete();
              clearTimeout(processingTimeout);
              return reject(
                "No se encontró el tablero. Toma la foto desde arriba y bien iluminada.",
              );
            }

            console.log("⚙️ 4. Enderezando (Perspectiva)...");
            let cornerArray = [];
            for (let i = 0; i < 4; i++) {
              cornerArray.push({
                x: bestContour.data32S[i * 2],
                y: bestContour.data32S[i * 2 + 1],
              });
            }

            cornerArray.sort((a: any, b: any) => a.y - b.y);
            const topChars = cornerArray
              .slice(0, 2)
              .sort((a: any, b: any) => a.x - b.x);
            const bottomChars = cornerArray
              .slice(2, 4)
              .sort((a: any, b: any) => a.x - b.x);
            const orderedCorners = [
              topChars[0],
              topChars[1],
              bottomChars[1],
              bottomChars[0],
            ];

            const OUTPUT_SIZE = 600;
            let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
              orderedCorners[0].x,
              orderedCorners[0].y,
              orderedCorners[1].x,
              orderedCorners[1].y,
              orderedCorners[2].x,
              orderedCorners[2].y,
              orderedCorners[3].x,
              orderedCorners[3].y,
            ]);
            let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
              0,
              0,
              OUTPUT_SIZE,
              0,
              OUTPUT_SIZE,
              OUTPUT_SIZE,
              0,
              OUTPUT_SIZE,
            ]);

            let M = cv.getPerspectiveTransform(srcTri, dstTri);
            let warped = new cv.Mat();
            cv.warpPerspective(
              src,
              warped,
              M,
              new cv.Size(OUTPUT_SIZE, OUTPUT_SIZE),
            );

            const outputCanvas = document.createElement("canvas");
            cv.imshow(outputCanvas, warped);
            const warpedBase64 = outputCanvas.toDataURL("image/jpeg", 0.9);

            src.delete();
            gray.delete();
            blurred.delete();
            thresholded.delete();
            contours.delete();
            hierarchy.delete();
            bestContour.delete();
            srcTri.delete();
            dstTri.delete();
            M.delete();
            warped.delete();

            clearTimeout(processingTimeout);
            console.log("✅ Visión completada.");
            resolve(warpedBase64);
          } catch (error) {
            console.error("💥 Error matemático:", error);
            clearTimeout(processingTimeout);
            reject("Error al enderezar la foto.");
          }
        }, 50);
      };

      imgElement.onerror = () => {
        clearTimeout(processingTimeout);
        reject("El navegador no pudo cargar la imagen.");
      };

      imgElement.src = e.target?.result as string;
    };

    reader.onerror = () => {
      clearTimeout(processingTimeout);
      reject("Error al leer el archivo desde tu dispositivo.");
    };

    // Iniciamos la lectura segura
    reader.readAsDataURL(file);
  });
};

/**
 * HERRAMIENTA 2: CORTADOR ESPACIAL V2 (Corte de Precisión)
 * Corta exactamente la cuadrícula y le quita el borde a cada celda individualmente
 * para no morder los números.
 */
export const sliceImageInto81 = (base64Image: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;
    img.onload = () => {
      const pieces: string[] = [];
      const TARGET_SIZE = 100;

      // Ya no usamos PADDING global porque OpenCV ya recortó el tablero perfecto
      const cellW = img.width / 9;
      const cellH = img.height / 9;

      // Le quitamos un 12% a CADA LADO de la celda individual para evitar la línea negra
      const cellPaddingX = cellW * 0.12;
      const cellPaddingY = cellH * 0.12;

      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const canvas = document.createElement("canvas");
          canvas.width = TARGET_SIZE;
          canvas.height = TARGET_SIZE;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Recortamos solo el centro absoluto de la celda
            ctx.drawImage(
              img,
              col * cellW + cellPaddingX,
              row * cellH + cellPaddingY,
              cellW - cellPaddingX * 2,
              cellH - cellPaddingY * 2,
              0,
              0,
              TARGET_SIZE,
              TARGET_SIZE,
            );
            pieces.push(canvas.toDataURL("image/jpeg", 0.9));
          }
        }
      }
      resolve(pieces);
    };
    img.onerror = () => reject("Fallo al trocear la imagen.");
  });
};
/**
 * HERRAMIENTA 3: CREADOR DE COLLAGE (Con Cuadrícula Roja)
 * Implementa la idea del usuario de usar líneas rojas para ayudar a la IA.
 */
export const createSudokuCollage = async (
  pieces: string[],
): Promise<string> => {
  return new Promise(async (resolve) => {
    const CELL_SIZE = 60; // Hacemos las celdas un poco más pequeñas para un collage compacto
    const BORDER = 6; // Borde rojo grueso y visible
    const TOTAL_CELL_SIZE = CELL_SIZE + BORDER * 2;

    // Calculamos cuántas filas y columnas necesitamos para las piezas que llegaron
    const totalPieces = pieces.length;
    const cols = Math.min(totalPieces, 9); // Máximo 9 columnas
    const rows = Math.ceil(totalPieces / cols);

    const canvas = document.createElement("canvas");
    canvas.width = TOTAL_CELL_SIZE * cols;
    canvas.height = TOTAL_CELL_SIZE * rows;
    const ctx = canvas.getContext("2d");

    if (!ctx) return resolve("");

    // --- LA IDEA DEL USUARIO: FONDO ROJO INTENSO ---
    ctx.fillStyle = "#FF0000"; // Rojo puro
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const imgPromises = pieces.map(
      (src) =>
        new Promise<HTMLImageElement>((res) => {
          const img = new Image();
          img.src = src;
          img.onload = () => res(img);
        }),
    );

    const loadedImages = await Promise.all(imgPromises);

    loadedImages.forEach((img, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      // Pegamos la imagen dejando el borde rojo alrededor
      ctx.drawImage(
        img,
        col * TOTAL_CELL_SIZE + BORDER,
        row * TOTAL_CELL_SIZE + BORDER,
        CELL_SIZE,
        CELL_SIZE,
      );
    });

    resolve(canvas.toDataURL("image/jpeg", 0.9));
  });
};

/**
 * HERRAMIENTA 4: DETECTOR DE TINTA V3 (Calibrado)
 */
export const hasInk = (base64Image: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;
    img.onerror = reject;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 40;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) return resolve(false);

      ctx.drawImage(img, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;

      let darkPixels = 0;

      // Ajuste 1: Margen del 15% (antes 25%). Así no cortamos números descentrados.
      const margin = Math.floor(size * 0.15);

      for (let y = margin; y < size - margin; y++) {
        for (let x = margin; x < size - margin; x++) {
          const i = (y * size + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const brightness = (r + g + b) / 3;

          // Ajuste 2: Umbral en 130 (antes 110). Para atrapar números no tan negros.
          if (brightness < 130) {
            darkPixels++;
          }
        }
      }

      // Ajuste 3: Con solo 10 píxeles oscuros nos basta (antes 15). Ideal para el número "1".
      resolve(darkPixels > 10);
    };
  });
};
