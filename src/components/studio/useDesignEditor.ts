"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StudioProduct } from "./studio-products";

/* Fabric is loaded dynamically (browser only) to avoid SSR issues.
   Loose typing keeps the v6 dynamic-import ergonomic. */
type Fabric = any;
type FObject = any;

export interface EditorSelection {
  type: "text" | "image" | "none";
  fontFamily: string;
  fontSize: number;
  fill: string;
  textAlign: string;
  bold: boolean;
  italic: boolean;
  text: string;
}

const EMPTY_SELECTION: EditorSelection = {
  type: "none",
  fontFamily: "Cairo",
  fontSize: 28,
  fill: "#2C2A26",
  textAlign: "center",
  bold: false,
  italic: false,
  text: "",
};

interface PxArea {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function useDesignEditor(product: StudioProduct, addTextLabel: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Fabric | null>(null);
  const canvasRef = useRef<FObject | null>(null);
  const areaRef = useRef<PxArea>({ left: 0, top: 0, width: 0, height: 0 });

  const history = useRef<string[]>([]);
  const histIndex = useRef(-1);
  const restoring = useRef(false);

  const [ready, setReady] = useState(false);
  const [selection, setSelection] = useState<EditorSelection>(EMPTY_SELECTION);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [lowRes, setLowRes] = useState(false);

  /* ── history ── */
  const snapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || restoring.current) return;
    const json = JSON.stringify(canvas.toJSON());
    history.current = history.current.slice(0, histIndex.current + 1);
    history.current.push(json);
    if (history.current.length > 40) history.current.shift();
    histIndex.current = history.current.length - 1;
    setCanUndo(histIndex.current > 0);
    setCanRedo(false);
  }, []);

  const restore = useCallback(async (json: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    restoring.current = true;
    await canvas.loadFromJSON(json);
    canvas.requestRenderAll();
    restoring.current = false;
  }, []);

  /* ── selection mirror ── */
  const syncSelection = useCallback(() => {
    const canvas = canvasRef.current;
    const obj: FObject = canvas?.getActiveObject();
    if (!obj) {
      setSelection(EMPTY_SELECTION);
      return;
    }
    const isText = obj.type === "textbox" || obj.type === "i-text" || obj.type === "text";
    setSelection({
      type: isText ? "text" : "image",
      fontFamily: obj.fontFamily ?? "Cairo",
      fontSize: Math.round(obj.fontSize ?? 28),
      fill: typeof obj.fill === "string" ? obj.fill : "#2C2A26",
      textAlign: obj.textAlign ?? "center",
      bold: obj.fontWeight === "bold" || obj.fontWeight === 700,
      italic: obj.fontStyle === "italic",
      text: obj.text ?? "",
    });
  }, []);

  /* keep added objects inside the print area */
  const clampToArea = useCallback((obj: FObject) => {
    const a = areaRef.current;
    obj.left = Math.min(Math.max(obj.left, a.left), a.left + a.width);
    obj.top = Math.min(Math.max(obj.top, a.top), a.top + a.height);
  }, []);

  const makeClip = useCallback((): FObject => {
    const f = fabricRef.current;
    const a = areaRef.current;
    return new f.Rect({
      left: a.left,
      top: a.top,
      width: a.width,
      height: a.height,
      absolutePositioned: true,
    });
  }, []);

  /* ── init / re-init when product changes ── */
  useEffect(() => {
    let disposed = false;
    setReady(false);

    (async () => {
      const f: Fabric = await import("fabric");
      fabricRef.current = f;
      if (disposed || !canvasElRef.current || !containerRef.current) return;

      const cw = Math.min(Math.max(containerRef.current.clientWidth, 240), 440);
      const width = cw;
      const height = Math.round(cw / product.aspect);

      // dispose any previous canvas
      if (canvasRef.current) {
        try {
          canvasRef.current.dispose();
        } catch {
          /* ignore */
        }
      }

      const canvas = new f.Canvas(canvasElRef.current, {
        width,
        height,
        backgroundColor: "#15130f",
        preserveObjectStacking: true,
        selection: true,
      });
      canvasRef.current = canvas;

      // print area in pixels
      const pa = product.printArea;
      areaRef.current = {
        left: (pa.left / 100) * width,
        top: (pa.top / 100) * height,
        width: (pa.width / 100) * width,
        height: (pa.height / 100) * height,
      };

      // mockup background
      const bg: FObject = await f.FabricImage.fromURL(product.mockup, {
        crossOrigin: "anonymous",
      });
      if (disposed) return;
      bg.set({ originX: "left", originY: "top", scaleX: width / bg.width, scaleY: height / bg.height });
      canvas.backgroundImage = bg;

      // dashed print boundary, drawn on top after every render
      canvas.on("after:render", () => {
        const a = areaRef.current;
        const ctx = canvas.getContext();
        ctx.save();
        ctx.setLineDash([6, 5]);
        // dark underlay (visible on light products like the white bag panel)
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.strokeRect(a.left, a.top, a.width, a.height);
        // light dashes on top (visible on dark products like the mug/bottle)
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.strokeRect(a.left, a.top, a.width, a.height);
        ctx.restore();
      });

      // events
      canvas.on("object:moving", (e: FObject) => clampToArea(e.target));
      canvas.on("object:modified", () => {
        snapshot();
        syncSelection();
      });
      canvas.on("object:added", () => snapshot());
      canvas.on("object:removed", () => snapshot());
      canvas.on("selection:created", syncSelection);
      canvas.on("selection:updated", syncSelection);
      canvas.on("selection:cleared", syncSelection);

      canvas.requestRenderAll();
      history.current = [JSON.stringify(canvas.toJSON())];
      histIndex.current = 0;
      setCanUndo(false);
      setCanRedo(false);
      setZoom(1);
      setReady(true);
    })();

    return () => {
      disposed = true;
      if (canvasRef.current) {
        try {
          canvasRef.current.dispose();
        } catch {
          /* ignore */
        }
        canvasRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  /* ── actions ── */
  const addText = useCallback(() => {
    const f = fabricRef.current;
    const canvas = canvasRef.current;
    if (!f || !canvas) return;
    const a = areaRef.current;
    const t = new f.Textbox(addTextLabel, {
      left: a.left + a.width / 2,
      top: a.top + a.height / 2,
      originX: "center",
      originY: "center",
      fontSize: Math.max(16, Math.round(a.width / 8)),
      fill: "#2C2A26",
      fontFamily: "Cairo",
      textAlign: "center",
      width: a.width * 0.8,
      editable: true,
    });
    t.clipPath = makeClip();
    canvas.add(t);
    canvas.setActiveObject(t);
    canvas.requestRenderAll();
    syncSelection();
  }, [addTextLabel, makeClip, syncSelection]);

  const addImageFromUrl = useCallback(
    async (url: string) => {
      const f = fabricRef.current;
      const canvas = canvasRef.current;
      if (!f || !canvas) return;
      setBusy(true);
      try {
        const img: FObject = await f.FabricImage.fromURL(url, { crossOrigin: "anonymous" });
        const a = areaRef.current;
        // low-res warning: image must comfortably cover the print area
        setLowRes(img.width < a.width * 0.9 || img.height < a.height * 0.9);
        const scale = Math.min((a.width * 0.9) / img.width, (a.height * 0.9) / img.height);
        img.set({
          left: a.left + a.width / 2,
          top: a.top + a.height / 2,
          originX: "center",
          originY: "center",
          scaleX: scale,
          scaleY: scale,
        });
        img.clipPath = makeClip();
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
        syncSelection();
      } finally {
        setBusy(false);
      }
    },
    [makeClip, syncSelection],
  );

  const addImageFromFile = useCallback(
    (file: File) =>
      new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = async () => {
          await addImageFromUrl(reader.result as string);
          resolve();
        };
        reader.readAsDataURL(file);
      }),
    [addImageFromUrl],
  );

  const withActive = useCallback((fn: (obj: FObject, canvas: FObject) => void) => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject();
    if (!canvas || !obj) return;
    fn(obj, canvas);
    canvas.requestRenderAll();
  }, []);

  const deleteActive = useCallback(() => {
    withActive((obj, canvas) => {
      canvas.remove(obj);
      canvas.discardActiveObject();
      syncSelection();
    });
  }, [withActive, syncSelection]);

  const duplicateActive = useCallback(() => {
    withActive(async (obj, canvas) => {
      const clone = await obj.clone();
      clone.set({ left: obj.left + 12, top: obj.top + 12 });
      clone.clipPath = makeClip();
      canvas.add(clone);
      canvas.setActiveObject(clone);
      canvas.requestRenderAll();
    });
  }, [withActive, makeClip]);

  const bringForward = useCallback(() => withActive((o, c) => c.bringObjectForward(o)), [withActive]);
  const sendBackward = useCallback(() => withActive((o, c) => c.sendObjectBackwards(o)), [withActive]);

  const updateText = useCallback(
    (patch: Partial<EditorSelection>) => {
      withActive((obj) => {
        if (patch.text !== undefined) obj.set("text", patch.text);
        if (patch.fontFamily !== undefined) obj.set("fontFamily", patch.fontFamily);
        if (patch.fontSize !== undefined) obj.set("fontSize", patch.fontSize);
        if (patch.fill !== undefined) obj.set("fill", patch.fill);
        if (patch.textAlign !== undefined) obj.set("textAlign", patch.textAlign);
        if (patch.bold !== undefined) obj.set("fontWeight", patch.bold ? "bold" : "normal");
        if (patch.italic !== undefined) obj.set("fontStyle", patch.italic ? "italic" : "normal");
      });
      setSelection((s) => ({ ...s, ...patch }));
      snapshot();
    },
    [withActive, snapshot],
  );

  const undo = useCallback(async () => {
    if (histIndex.current <= 0) return;
    histIndex.current -= 1;
    await restore(history.current[histIndex.current]);
    setCanUndo(histIndex.current > 0);
    setCanRedo(true);
    syncSelection();
  }, [restore, syncSelection]);

  const redo = useCallback(async () => {
    if (histIndex.current >= history.current.length - 1) return;
    histIndex.current += 1;
    await restore(history.current[histIndex.current]);
    setCanUndo(true);
    setCanRedo(histIndex.current < history.current.length - 1);
    syncSelection();
  }, [restore, syncSelection]);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(2, +(z + 0.15).toFixed(2))), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2))), []);
  const resetZoom = useCallback(() => setZoom(1), []);

  const exportPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    return canvas.toDataURL({ format: "png", multiplier: 2 });
  }, []);

  const getJSON = useCallback(() => {
    const canvas = canvasRef.current;
    return canvas ? JSON.stringify(canvas.toJSON()) : "{}";
  }, []);

  const loadJSONString = useCallback(
    async (json: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      await canvas.loadFromJSON(json);
      // re-apply clip paths to restored objects
      canvas.getObjects().forEach((o: FObject) => {
        o.clipPath = makeClip();
      });
      canvas.requestRenderAll();
      snapshot();
      syncSelection();
    },
    [makeClip, snapshot, syncSelection],
  );

  return {
    containerRef,
    canvasElRef,
    ready,
    selection,
    canUndo,
    canRedo,
    zoom,
    busy,
    lowRes,
    addText,
    addImageFromUrl,
    addImageFromFile,
    deleteActive,
    duplicateActive,
    bringForward,
    sendBackward,
    updateText,
    undo,
    redo,
    zoomIn,
    zoomOut,
    resetZoom,
    exportPNG,
    getJSON,
    loadJSONString,
  };
}
