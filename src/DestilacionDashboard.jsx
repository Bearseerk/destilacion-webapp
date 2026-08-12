import React, { useState, useMemo, useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const API_BASE_URL = "https://proto-destilacion-g3czgaadh3ambycx.southcentralus-01.azurewebsites.net/api";

// ── Convierte el formato que devuelve la API (columnas de la tabla Recetas)
// al formato que ya usa toda la gráfica/UI (tempInterna/tempExterna/ph como [min,max])
function apiRecetaToFrontend(r) {
  return {
    id: r.id,
    nombre: r.nombre,
    esGlobal: !!r.esGlobal,
    tempInterna: [r.tempMinFermentador, r.tempMaxFermentador],
    tempExterna: [r.tempMinRefrigerador, r.tempMaxRefrigerador],
    ph: [r.phMin, r.phMax],
    densidadInicial: r.densidadInicial,
    densidadFinal: r.densidadFinal,
  };
}

// El nuevo logo en base64
// Inside function Header({ onLogout })
<img
  src={"data:image png;base64,iVBORw0KGgoAAAANSUhEUgAAAvIAAAHyCAYAAACc+mH1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFxEAABcRAcom8z8AABa9SURBVHhe7d15mBzVnffx/73XmXd6M/YyDAPMMgsKy2CwgGAAURQEBKMg6Ioi4iIqiCjgiqioI4KLK4iKgoAgyi2IoqKIgwgiCAgyDDPMMDMzzMDwzN71uqvfH33v08z8/v3769+q7+fM0T3dvapf9Wv/9X3P3z/m93/P4/e/uf3v97//4/c///P3f/7z93/+8/d//vP3f//7P3///z9///8/f//3P3//9z9//7c///333//999///+/8//+/8///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v///v"} // <-- Change LOGO_URL to NEW_LOGO_URL here
  alt="Logo"
  style={{ width: 46, height: 46, borderRadius: 6, objectFit: "cover", background: palette.bg }}
/>
// ── Paleta heredada del diseño MERMAZ (ámbar sobre negro) ──
const palette = {
  bg: "#0b0806",
  panel: "#14100b",
  panelAlt: "#1c150d",
  border: "#2e2417",
  borderSoft: "#241c11",
  textDim: "#9c8d6f",
  textMute: "#82734f",
  textLight: "#e7ddca",
  textBright: "#f5efe2",
  amber: "#e89a24",
  amberSoft: "#df8a18",
  gold: "#f6c44e",
  good: "#7fae6b",
  warn: "#e0a83e",
  rojo: "#d15252",
  azul: "#6fa8c9",
  azulClaro: "#8ecfe8",
  blanco: "#f4f4f4",
};

// ── Recetas predefinidas (las 10 populares) ──
// densidadInicial = gravedad al arrancar (mucha azúcar sin fermentar todavía)
// densidadFinal   = gravedad esperada al terminar (la levadura ya consumió el azúcar)
const RECETAS_PREDEFINIDAS = [
  { id: "lager", nombre: "Lager", esGlobal: true, tempInterna: [7, 13], tempExterna: [2, 6], ph: [4.2, 4.6], densidadInicial: 1.045, densidadFinal: 1.010 },
  { id: "ale", nombre: "Ale", esGlobal: true, tempInterna: [18, 22], tempExterna: [14, 18], ph: [4.0, 4.8], densidadInicial: 1.050, densidadFinal: 1.012 },
  { id: "ipa", nombre: "IPA", esGlobal: true, tempInterna: [19, 22], tempExterna: [15, 19], ph: [4.0, 4.5], densidadInicial: 1.060, densidadFinal: 1.012 },
  { id: "stout", nombre: "Stout", esGlobal: true, tempInterna: [18, 22], tempExterna: [14, 18], ph: [4.0, 4.8], densidadInicial: 1.060, densidadFinal: 1.015 },
  { id: "wheat", nombre: "Wheat Beer", esGlobal: true, tempInterna: [17, 22], tempExterna: [13, 18], ph: [4.1, 4.6], densidadInicial: 1.048, densidadFinal: 1.010 },
  { id: "porter", nombre: "Porter", esGlobal: true, tempInterna: [18, 22], tempExterna: [14, 18], ph: [4.0, 4.8], densidadInicial: 1.055, densidadFinal: 1.014 },
  { id: "pilsner", nombre: "Pilsner", esGlobal: true, tempInterna: [8, 12], tempExterna: [3, 7], ph: [4.2, 4.6], densidadInicial: 1.048, densidadFinal: 1.010 },
  { id: "saison", nombre: "Saison", esGlobal: true, tempInterna: [22, 26], tempExterna: [18, 22], ph: [4.0, 4.5], densidadInicial: 1.055, densidadFinal: 1.008 },
  { id: "sour", nombre: "Sour", esGlobal: true, tempInterna: [20, 24], tempExterna: [16, 20], ph: [3.2, 3.8], densidadInicial: 1.050, densidadFinal: 1.010 },
  { id: "mead", nombre: "Mead", esGlobal: true, tempInterna: [18, 24], tempExterna: [14, 20], ph: [3.8, 4.2], densidadInicial: 1.080, densidadFinal: 1.010 },
];

// ── Generador de serie de ejemplo (aquí se conecta el fetch real a la Function App) ──
function generarSerieDemo(receta, puntos = 24) {
  const midTI = (receta.tempInterna[0] + receta.tempInterna[1]) / 2;
  const midTE = (receta.tempExterna[0] + receta.tempExterna[1]) / 2;
  const midPh = (receta.ph[0] + receta.ph[1]) / 2;
  const dIni = receta.densidadInicial;
  const dFin = receta.densidadFinal;

  const minutoAhora = Date.now() / 60000;

  return Array.from({ length: puntos }, (_, i) => {
    const desvio = i > 14 && i < 18 ? 3.5 : 0;
    const progreso = i / (puntos - 1);
    const minutosAtras = (puntos - 1 - i) * (12 / 60);
    return {
      tiempo: `hace ${Math.round((puntos - 1 - i) * 12)}s`,
      idx: minutoAhora - minutosAtras,
      tempInterna: +(midTI + Math.sin(i / 3) * 1.1 + desvio + (Math.random() - 0.5) * 0.4).toFixed(2),
      tempExterna: +(midTE + Math.sin(i / 4) * 0.8 + (Math.random() - 0.5) * 0.3).toFixed(2),
      ph: +(midPh + Math.sin(i / 5) * 0.12 + (Math.random() - 0.5) * 0.05).toFixed(2),
      densidad: +(dIni - (dIni - dFin) * progreso + (Math.random() - 0.5) * 0.0015).toFixed(3),
    };
  });
}

// ── Divide una serie en segmentos continuos "en rango" / "fuera de rango" ──
function segmentar(serie, key, rango) {
  if (!rango) return [{ data: serie, fuera: false }];
  const [min, max] = rango;
  const segmentos = [];
  let actual = [];
  let estadoActual = null;

  serie.forEach((punto, i) => {
    const fuera = punto[key] < min || punto[key] > max;
    if (estadoActual === null) {
      estadoActual = fuera;
      actual = [punto];
    } else if (fuera === estadoActual) {
      actual.push(punto);
    } else {
      actual.push(punto);
      segmentos.push({ data: actual, fuera: estadoActual });
      actual = [punto];
      estadoActual = fuera;
    }
  });
  if (actual.length) segmentos.push({ data: actual, fuera: estadoActual });
  return segmentos;
}

// ── FIX #1: Calcula cuánto tiempo estuvo fuera de rango, pero SOLO
//    considerando las últimas 24 horas (evita el bug de acumular
//    "50 horas fuera de rango" de datos de pruebas de varios días
//    distintos). Usa el tiempo real entre lecturas consecutivas
//    (idx = minutos desde epoch), no un intervalo fijo. ──
function tiempoFueraDeRango(serie, key, rango) {
  if (!rango || serie.length < 2) return 0;

  const ahoraMinutos = Date.now() / 60000;
  const serieUltimas24h = serie.filter((p) => p.idx >= ahoraMinutos - 1440);
  if (serieUltimas24h.length < 2) return 0;

  const [min, max] = rango;
  let minutosFuera = 0;
  for (let i = 1; i < serieUltimas24h.length; i++) {
    const punto = serieUltimas24h[i];
    const fuera = punto[key] < min || punto[key] > max;
    if (!fuera) continue;
    const deltaMin = punto.idx - serieUltimas24h[i - 1].idx;
    if (deltaMin > 0) minutosFuera += deltaMin;
  }
  return Math.round(minutosFuera);
}

function formatoDuracion(minutos) {
  if (minutos === 0) return "0 min";
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

const METRICAS = {
  global: { label: "Global", key: null, color: null, unidad: "" },
  tempInterna: { label: "Temp. Interna", key: "tempInterna", color: palette.amber, unidad: "°C" },
  tempExterna: { label: "Temp. Externa", key: "tempExterna", color: palette.blanco, unidad: "°C" },
  ph: { label: "pH", key: "ph", color: palette.azulClaro, unidad: "" },
  densidad: { label: "Densidad", key: "densidad", color: palette.good, unidad: "SG" },
};

function Metric({ label, valor, unidad, fueraMin, color }) {
  const enRango = fueraMin === 0;
  return (
    <div
      style={{
        background: palette.panel,
        border: `1px solid ${enRango ? palette.border : palette.rojo}`,
        borderRadius: 4,
        padding: "16px 18px",
        flex: 1,
        minWidth: 170,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10.5,
            letterSpacing: "0.1em",
            color: palette.textMute,
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: palette.textBright, fontWeight: 600 }}>
          {valor}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: palette.textDim }}>{unidad}</span>
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10.5,
          color: enRango ? palette.good : palette.rojo,
        }}
      >
        {enRango ? "En rango" : `Fuera de rango: ${formatoDuracion(fueraMin)}`}
      </div>
    </div>
  );
}

function BotonFiltro({ activo, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11.5,
        letterSpacing: "0.05em",
        padding: "7px 14px",
        borderRadius: 20,
        border: `1px solid ${activo ? (color || palette.amber) : palette.border}`,
        background: activo ? (color ? `${color}22` : `${palette.amber}22`) : "transparent",
        color: activo ? palette.textBright : palette.textMute,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.15s ease",
      }}
    >
      {color && <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />}
      {label}
    </button>
  );
}

// ── FIX #3: Selector de rango de horas visibles en la gráfica ──
function SelectorRango({ horas, onChange }) {
  const opciones = [1, 2, 6, 12, 24];
  const [custom, setCustom] = useState("");

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: palette.textMute, marginRight: 2 }}>
        VER:
      </span>
      {opciones.map((h) => (
        <button
          key={h}
          onClick={() => { onChange(h); setCustom(""); }}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            padding: "5px 10px",
            borderRadius: 14,
            border: `1px solid ${horas === h ? palette.amber : palette.border}`,
            background: horas === h ? `${palette.amber}22` : "transparent",
            color: horas === h ? palette.textBright : palette.textMute,
            cursor: "pointer",
          }}
        >
          {h}h
        </button>
      ))}
      <input
        type="number"
        min="1"
        max="720"
        placeholder="hrs"
        value={custom}
        onChange={(e) => {
          const v = e.target.value;
          setCustom(v);
          const n = parseInt(v, 10);
          if (n > 0) onChange(n);
        }}
        style={{
          width: 52,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          padding: "5px 8px",
          borderRadius: 14,
          border: `1px solid ${palette.border}`,
          background: palette.panelAlt,
          color: palette.textBright,
          outline: "none",
        }}
      />
    </div>
  );
}

function GraficaCombinada({ serie, rangos, filtro, horasVentana = 24 }) {
  // Ventana MÓVIL de las últimas N horas (configurable — FIX #3), terminando
  // siempre en "ahora". Se va recorriendo sola: cada minuto que pasa, se
  // "cae" del lado izquierdo lo que ya tiene más de N horas.
  const [ahoraMin, setAhoraMin] = useState(() => Date.now() / 60000);
  useEffect(() => {
    const id = setInterval(() => setAhoraMin(Date.now() / 60000), 5000);
    return () => clearInterval(id);
  }, []);

  const VENTANA_MIN = horasVentana * 60;
  const domainMin = ahoraMin - VENTANA_MIN;
  const domainMax = ahoraMin;

  // El intervalo entre marcas se adapta al tamaño de la ventana.
  const intervaloTick = horasVentana <= 2 ? 15 : horasVentana <= 12 ? 30 : 60;
  const ticks = [];
  const primerTick = Math.ceil(domainMin / intervaloTick) * intervaloTick;
  for (let t = primerTick; t <= domainMax; t += intervaloTick) ticks.push(t);

  function formatoHora12(minutosEpoch) {
    const fecha = new Date(minutosEpoch * 60000);
    const h = fecha.getHours();
    const h12 = h % 12 === 0 ? 12 : h % 12;
    if (intervaloTick < 60) {
      const m = fecha.getMinutes();
      return `${h12}:${String(m).padStart(2, "0")}`;
    }
    return String(h12);
  }

  const serieVisible = serie.filter((p) => p.idx >= domainMin && p.idx <= domainMax);

  const metricasAMostrar = filtro === "global" ? ["tempInterna", "tempExterna", "ph", "densidad"] : [filtro];

  const necesitaEjePh = filtro === "global" || filtro === "ph";
  const necesitaEjeDensidad = filtro === "global" || filtro === "densidad";

  const tiempoPorIdx = {};
  serieVisible.forEach((p) => { tiempoPorIdx[p.idx] = p.tiempo; });

  function tooltipPersonalizado({ active, payload, label }) {
    if (!active || !payload || payload.length === 0) return null;
    const vistos = new Set();
    const filas = [];
    payload.forEach((entry) => {
      if (entry.payload?.idx !== label) return;
      if (vistos.has(entry.name)) return;
      vistos.add(entry.name);
      filas.push(entry);
    });
    if (filas.length === 0) return null;
    return (
      <div
        style={{
          background: palette.panelAlt,
          border: `1px solid ${palette.border}`,
          borderRadius: 4,
          fontFamily: "IBM Plex Mono",
          fontSize: 12,
          padding: "8px 10px",
        }}
      >
        <div style={{ color: palette.textDim, marginBottom: 4 }}>{tiempoPorIdx[label] ?? ""}</div>
        {filas.map((entry) => (
          <div key={entry.name} style={{ color: entry.color }}>
            {(METRICAS[entry.name]?.label ?? entry.name)} : {entry.value}
          </div>
        ))}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={palette.borderSoft} vertical={false} />
        <XAxis
          dataKey="idx"
          type="number"
          domain={[domainMin, domainMax]}
          ticks={ticks}
          tickFormatter={formatoHora12}
          tick={{ fill: palette.textMute, fontSize: 10.5, fontFamily: "IBM Plex Mono" }}
          axisLine={{ stroke: palette.border }}
          tickLine={false}
        />
        <YAxis
          yAxisId="temp"
          tick={{ fill: palette.textMute, fontSize: 10.5, fontFamily: "IBM Plex Mono" }}
          axisLine={false}
          tickLine={false}
          width={40}
          label={{ value: "°C", position: "insideTopLeft", fill: palette.textMute, fontSize: 10 }}
        />
        {necesitaEjePh && (
          <YAxis
            yAxisId="ph"
            orientation="right"
            tick={{ fill: palette.textMute, fontSize: 10.5, fontFamily: "IBM Plex Mono" }}
            axisLine={false}
            tickLine={false}
            width={34}
            domain={["auto", "auto"]}
          />
        )}
        {necesitaEjeDensidad && (
          <YAxis
            yAxisId="densidad"
            orientation="right"
            tick={{ fill: palette.textMute, fontSize: 10.5, fontFamily: "IBM Plex Mono" }}
            axisLine={false}
            tickLine={false}
            width={46}
            domain={["auto", "auto"]}
            hide={filtro === "global"}
          />
        )}
        <Tooltip content={tooltipPersonalizado} />
        <Legend
          wrapperStyle={{ fontFamily: "IBM Plex Mono", fontSize: 11, color: palette.textDim }}
          formatter={(value) => METRICAS[value]?.label ?? value}
        />

        {metricasAMostrar.map((metricaId) => {
          const m = METRICAS[metricaId];
          const eje = metricaId === "ph" ? "ph" : metricaId === "densidad" ? "densidad" : "temp";
          const segmentos = segmentar(serieVisible, m.key, rangos[metricaId]);

          return segmentos.map((seg, i) => (
            <Line
              key={`${metricaId}-${i}`}
              yAxisId={eje}
              data={seg.data}
              dataKey={m.key}
              name={metricaId}
              stroke={seg.fuera ? palette.rojo : m.color}
              strokeWidth={seg.fuera ? 2.5 : 2}
              dot={false}
              isAnimationActive={false}
              legendType={i === 0 ? "line" : "none"}
              connectNulls
            />
          ));
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── FIX #4: Historial por día — selector de fecha, gráfica estática de
//    ese día (medianoche a medianoche fijo, no ventana móvil), y
//    promedios + horas fuera de rango de ese día en específico. ──
function HistorialDia({ deviceId, rangos }) {
  const [fecha, setFecha] = useState("");
  const [cargando, setCargando] = useState(false);
  const [serieDia, setSerieDia] = useState(null);
  const [error, setError] = useState("");

  async function cargarDia(fechaStr) {
    if (!fechaStr) return;
    setCargando(true);
    setError("");
    try {
      const inicio = new Date(`${fechaStr}T00:00:00`);
      const fin = new Date(`${fechaStr}T23:59:59.999`);
      const res = await fetch(
        `${API_BASE_URL}/lecturas?deviceId=${deviceId}&desde=${inicio.toISOString()}&hasta=${fin.toISOString()}&limite=4000`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      const mapeadas = (data.lecturas || []).map((l) => {
        const f = new Date(l.timestamp);
        return {
          tiempo: f.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
          idx: f.getTime() / 60000,
          tempInterna: l.tempFermentador,
          tempExterna: l.tempRefrigerador,
          ph: l.ph,
          densidad: l.densidad,
        };
      });
      setSerieDia(mapeadas);
    } catch (err) {
      console.error("Error al cargar historial del día:", err);
      setError("No se pudo cargar ese día.");
      setSerieDia(null);
    } finally {
      setCargando(false);
    }
  }

  function promedio(key) {
    if (!serieDia || serieDia.length === 0) return null;
    const vals = serieDia.map((p) => p[key]).filter((v) => v !== null && v !== undefined);
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  const duracionesDia = serieDia ? {
    tempInterna: tiempoFueraDeRango(serieDia, "tempInterna", rangos.tempInterna),
    tempExterna: tiempoFueraDeRango(serieDia, "tempExterna", rangos.tempExterna),
    ph: tiempoFueraDeRango(serieDia, "ph", rangos.ph),
    densidad: tiempoFueraDeRango(serieDia, "densidad", rangos.densidad),
  } : null;

  let domainMin = null, domainMax = null, ticksDia = [];
  if (fecha) {
    const inicio = new Date(`${fecha}T00:00:00`);
    domainMin = inicio.getTime() / 60000;
    domainMax = domainMin + 1439;
    ticksDia = Array.from({ length: 24 }, (_, h) => domainMin + h * 60);
  }

  function formatoHora12Dia(minutosEpoch) {
    const f = new Date(minutosEpoch * 60000);
    const h = f.getHours();
    return String(h % 12 === 0 ? 12 : h % 12);
  }

  function tooltipDia({ active, payload, label }) {
    if (!active || !payload || payload.length === 0) return null;
    const vistos = new Set();
    const filas = [];
    payload.forEach((entry) => {
      if (entry.payload?.idx !== label) return;
      if (vistos.has(entry.name)) return;
      vistos.add(entry.name);
      filas.push(entry);
    });
    if (filas.length === 0) return null;
    const f = new Date(label * 60000);
    return (
      <div style={{ background: palette.panelAlt, border: `1px solid ${palette.border}`, borderRadius: 4, fontFamily: "IBM Plex Mono", fontSize: 12, padding: "8px 10px" }}>
        <div style={{ color: palette.textDim, marginBottom: 4 }}>{f.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</div>
        {filas.map((entry) => (
          <div key={entry.name} style={{ color: entry.color }}>
            {(METRICAS[entry.name]?.label ?? entry.name)} : {entry.value}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${palette.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.1em", color: palette.textMute, textTransform: "uppercase" }}>
          Historial por día
        </div>
        <input
          type="date"
          value={fecha}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => { setFecha(e.target.value); cargarDia(e.target.value); }}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            padding: "7px 10px",
            borderRadius: 4,
            border: `1px solid ${palette.border}`,
            background: palette.panelAlt,
            color: palette.textBright,
            colorScheme: "dark",
          }}
        />
      </div>

      {!fecha && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: palette.textMute }}>
          Elige un día para ver su historial completo.
        </div>
      )}
      {cargando && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: palette.textMute }}>Cargando...</div>
      )}
      {error && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: palette.rojo }}>{error}</div>}

      {fecha && !cargando && serieDia && serieDia.length === 0 && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: palette.textMute }}>
          No hay lecturas registradas ese día.
        </div>
      )}

      {fecha && !cargando && serieDia && serieDia.length > 0 && (
        <>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
            <Metric label="Temp. Interna (prom.)" valor={promedio("tempInterna")?.toFixed(1) ?? "—"} unidad="°C" fueraMin={duracionesDia.tempInterna} color={palette.amber} />
            <Metric label="Temp. Externa (prom.)" valor={promedio("tempExterna")?.toFixed(1) ?? "—"} unidad="°C" fueraMin={duracionesDia.tempExterna} color={palette.blanco} />
            <Metric label="pH (prom.)" valor={promedio("ph")?.toFixed(2) ?? "—"} unidad="" fueraMin={duracionesDia.ph} color={palette.azulClaro} />
            <Metric label="Densidad (prom.)" valor={promedio("densidad")?.toFixed(3) ?? "—"} unidad="SG" fueraMin={duracionesDia.densidad} color={palette.good} />
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={palette.borderSoft} vertical={false} />
              <XAxis
                dataKey="idx"
                type="number"
                domain={[domainMin, domainMax]}
                ticks={ticksDia}
                tickFormatter={formatoHora12Dia}
                tick={{ fill: palette.textMute, fontSize: 10.5, fontFamily: "IBM Plex Mono" }}
                axisLine={{ stroke: palette.border }}
                tickLine={false}
              />
              <YAxis yAxisId="temp" tick={{ fill: palette.textMute, fontSize: 10.5, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} width={40} />
              <YAxis yAxisId="ph" orientation="right" tick={{ fill: palette.textMute, fontSize: 10.5, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} width={34} domain={["auto", "auto"]} />
              <YAxis yAxisId="densidad" orientation="right" hide domain={["auto", "auto"]} />
              <Tooltip content={tooltipDia} />
              <Legend wrapperStyle={{ fontFamily: "IBM Plex Mono", fontSize: 11, color: palette.textDim }} formatter={(value) => METRICAS[value]?.label ?? value} />
              {["tempInterna", "tempExterna", "ph", "densidad"].map((metricaId) => {
                const m = METRICAS[metricaId];
                const eje = metricaId === "ph" ? "ph" : metricaId === "densidad" ? "densidad" : "temp";
                const segmentos = segmentar(serieDia, m.key, rangos[metricaId]);
                return segmentos.map((seg, i) => (
                  <Line
                    key={`${metricaId}-${i}`}
                    yAxisId={eje}
                    data={seg.data}
                    dataKey={m.key}
                    name={metricaId}
                    stroke={seg.fuera ? palette.rojo : m.color}
                    strokeWidth={seg.fuera ? 2.5 : 2}
                    dot={false}
                    isAnimationActive={false}
                    legendType={i === 0 ? "line" : "none"}
                    connectNulls
                  />
                ));
              })}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}

function SelectorReceta({ recetas, recetaId, onChange, onCrear }) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    tempInternaMin: "",
    tempInternaMax: "",
    tempExternaMin: "",
    tempExternaMax: "",
    phMin: "",
    phMax: "",
    densidadInicial: "",
    densidadFinal: "",
  });

  async function guardar() {
    if (!form.nombre.trim()) return;
    setErrorGuardar("");
    setGuardando(true);
    try {
      await onCrear({
        nombre: form.nombre,
        tempMinFermentador: +form.tempInternaMin || 0,
        tempMaxFermentador: +form.tempInternaMax || 30,
        tempMinRefrigerador: +form.tempExternaMin || 0,
        tempMaxRefrigerador: +form.tempExternaMax || 30,
        phMin: +form.phMin || 3,
        phMax: +form.phMax || 5,
        densidadInicial: +form.densidadInicial || 1.05,
        densidadFinal: +form.densidadFinal || 1.01,
      });
      setMostrarForm(false);
      setForm({
        nombre: "",
        tempInternaMin: "",
        tempInternaMax: "",
        tempExternaMin: "",
        tempExternaMax: "",
        phMin: "",
        phMax: "",
        densidadInicial: "",
        densidadFinal: "",
      });
    } catch (err) {
      console.error("Error al guardar receta:", err);
      setErrorGuardar("No se pudo guardar la receta. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  const inputStyle = {
    background: palette.panelAlt,
    border: `1px solid ${palette.border}`,
    borderRadius: 4,
    color: palette.textBright,
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    padding: "6px 8px",
    width: 64,
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: palette.textMute, letterSpacing: "0.1em", marginRight: 4 }}>
          RECETA:
        </span>
        <select
          value={recetaId}
          onChange={(e) => {
            const valor = e.target.value;
            const idsNumericos = recetas.every((r) => typeof r.id === "number");
            onChange(idsNumericos ? Number(valor) : valor);
          }}
          style={{
            background: palette.panelAlt,
            border: `1px solid ${palette.border}`,
            borderRadius: 4,
            color: palette.textBright,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            padding: "6px 10px",
          }}
        >
          {recetas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}{!r.esGlobal ? " (personalizada)" : ""}
            </option>
          ))}
        </select>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11.5,
            padding: "6px 12px",
            borderRadius: 4,
            border: `1px solid ${palette.amberSoft}`,
            background: "transparent",
            color: palette.amber,
            cursor: "pointer",
          }}
        >
          {mostrarForm ? "Cancelar" : "+ Crear cerveza personalizada"}
        </button>
      </div>

      {mostrarForm && (
        <div
          style={{
            marginTop: 10,
            padding: 14,
            background: palette.panel,
            border: `1px solid ${palette.border}`,
            borderRadius: 4,
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div>
            <div style={{ fontSize: 10, color: palette.textMute, fontFamily: "IBM Plex Mono", marginBottom: 4 }}>Nombre</div>
            <input style={{ ...inputStyle, width: 140 }} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: palette.textMute, fontFamily: "IBM Plex Mono", marginBottom: 4 }}>Temp. interna °C</div>
            <div style={{ display: "flex", gap: 4 }}>
              <input style={inputStyle} placeholder="min" value={form.tempInternaMin} onChange={(e) => setForm({ ...form, tempInternaMin: e.target.value })} />
              <input style={inputStyle} placeholder="max" value={form.tempInternaMax} onChange={(e) => setForm({ ...form, tempInternaMax: e.target.value })} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: palette.textMute, fontFamily: "IBM Plex Mono", marginBottom: 4 }}>Temp. externa °C</div>
            <div style={{ display: "flex", gap: 4 }}>
              <input style={inputStyle} placeholder="min" value={form.tempExternaMin} onChange={(e) => setForm({ ...form, tempExternaMin: e.target.value })} />
              <input style={inputStyle} placeholder="max" value={form.tempExternaMax} onChange={(e) => setForm({ ...form, tempExternaMax: e.target.value })} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: palette.textMute, fontFamily: "IBM Plex Mono", marginBottom: 4 }}>pH</div>
            <div style={{ display: "flex", gap: 4 }}>
              <input style={inputStyle} placeholder="min" value={form.phMin} onChange={(e) => setForm({ ...form, phMin: e.target.value })} />
              <input style={inputStyle} placeholder="max" value={form.phMax} onChange={(e) => setForm({ ...form, phMax: e.target.value })} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: palette.textMute, fontFamily: "IBM Plex Mono", marginBottom: 4 }}>Densidad (SG)</div>
            <div style={{ display: "flex", gap: 4 }}>
              <input style={inputStyle} placeholder="inicial" value={form.densidadInicial} onChange={(e) => setForm({ ...form, densidadInicial: e.target.value })} />
              <input style={inputStyle} placeholder="final" value={form.densidadFinal} onChange={(e) => setForm({ ...form, densidadFinal: e.target.value })} />
            </div>
          </div>
          <button
            onClick={guardar}
            disabled={guardando}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              padding: "7px 16px",
              borderRadius: 4,
              border: "none",
              background: palette.amber,
              color: palette.bg,
              fontWeight: 600,
              cursor: guardando ? "default" : "pointer",
              opacity: guardando ? 0.7 : 1,
              height: 32,
            }}
          >
            {guardando ? "Guardando..." : "Guardar y usar"}
          </button>
          {errorGuardar && (
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: palette.rojo, width: "100%" }}>
              {errorGuardar}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ModuloCard({ modulo, usuarioId }) {
  const [recetas, setRecetas] = useState(RECETAS_PREDEFINIDAS);
  const [recetaId, setRecetaId] = useState(modulo.recetaId);
  const [filtro, setFiltro] = useState("global");
  const [horasVentana, setHorasVentana] = useState(24);
  const [cargandoRecetas, setCargandoRecetas] = useState(true);
  const [serieReal, setSerieReal] = useState(null);

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      try {
        const res = await fetch(`${API_BASE_URL}/recetas?usuarioId=${usuarioId}`);
        if (!res.ok) throw new Error("fallo");
        const data = await res.json();
        if (!cancelado && data.recetas && data.recetas.length > 0) {
          setRecetas(data.recetas.map(apiRecetaToFrontend));
        }
      } catch (err) {
        console.error("Error al cargar recetas:", err);
      } finally {
        if (!cancelado) setCargandoRecetas(false);
      }
    }
    cargar();
    return () => { cancelado = true; };
  }, [usuarioId]);

  useEffect(() => {
    let cancelado = false;

    async function cargarLecturas() {
      try {
        const res = await fetch(`${API_BASE_URL}/lecturas?deviceId=${modulo.deviceId}&limite=3600`);
        if (!res.ok) throw new Error("fallo");
        const data = await res.json();
        if (!cancelado && data.lecturas && data.lecturas.length > 0) {
          const mapeadas = data.lecturas.map((l) => {
            const fecha = new Date(l.timestamp);
            return {
              tiempo: fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
              idx: fecha.getTime() / 60000,
              tempInterna: l.tempFermentador,
              tempExterna: l.tempRefrigerador,
              ph: l.ph,
              densidad: l.densidad,
            };
          });
          setSerieReal(mapeadas);
        }
      } catch (err) {
        console.error("Error al cargar lecturas:", err);
      }
    }

    cargarLecturas();
    const intervalo = setInterval(cargarLecturas, 12000);
    return () => { cancelado = true; clearInterval(intervalo); };
  }, [modulo.deviceId]);

  useEffect(() => {
    let conexion;
    let cancelado = false;

    async function conectarSignalR() {
      conexion = new signalR.HubConnectionBuilder()
        .withUrl(API_BASE_URL, { withCredentials: false })
        .withAutomaticReconnect([0, 1000, 2000, 5000])
        .build();

      conexion.onreconnecting((err) => console.warn("SignalR: reconectando...", err));
      conexion.onreconnected(() => console.log("SignalR: reconectado."));
      conexion.onclose((err) => console.warn("SignalR: conexión cerrada.", err));

      conexion.on("nuevaLectura", (lectura) => {
        if (cancelado) return;
        if (lectura.deviceId !== modulo.deviceId) return;
        const fecha = new Date(lectura.timestamp);
        const punto = {
          tiempo: fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
          idx: fecha.getTime() / 60000,
          tempInterna: lectura.tempFermentador,
          tempExterna: lectura.tempRefrigerador,
          ph: lectura.ph,
          densidad: lectura.densidad,
        };
        setSerieReal((prev) => (prev ? [...prev, punto] : [punto]));
      });

      try {
        await conexion.start();
        console.log("SignalR conectado (WebSocket en vivo).");
      } catch (err) {
        console.error("Error al conectar SignalR:", err);
      }
    }

    conectarSignalR();
    return () => { cancelado = true; conexion?.stop(); };
  }, [modulo.deviceId]);

  const receta = recetas.find((r) => r.id === recetaId) ?? recetas[0];

  const serieDemo = useMemo(() => generarSerieDemo(receta), [receta]);
  const serie = serieReal ?? serieDemo;
  const hayDatosReales = serieReal !== null;

  const rangos = {
    tempInterna: receta.tempInterna,
    tempExterna: receta.tempExterna,
    ph: receta.ph,
    densidad: [Math.min(receta.densidadInicial, receta.densidadFinal), Math.max(receta.densidadInicial, receta.densidadFinal)],
  };

  const ultimo = serie[serie.length - 1];

  const duraciones = {
    tempInterna: tiempoFueraDeRango(serie, "tempInterna", rangos.tempInterna),
    tempExterna: tiempoFueraDeRango(serie, "tempExterna", rangos.tempExterna),
    ph: tiempoFueraDeRango(serie, "ph", rangos.ph),
    densidad: tiempoFueraDeRango(serie, "densidad", rangos.densidad),
  };

  // ── FIX #2: persiste la receta seleccionada en la BD (tabla Usuarios,
  //    columna ultimaRecetaId) para que se recuerde entre sesiones. ──
  async function guardarUltimaReceta(id) {
    try {
      await fetch(`${API_BASE_URL}/usuario`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId, ultimaRecetaId: id }),
      });
    } catch (err) {
      console.error("Error al guardar la última receta:", err);
    }
  }

  return (
    <div style={{ background: palette.bg, border: `1px solid ${palette.border}`, borderRadius: 6, padding: 24, marginBottom: 24 }}>
      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.14em", color: palette.textMute, textTransform: "uppercase" }}>
            Módulo · {modulo.id}
            {cargandoRecetas && (
              <span style={{ marginLeft: 8, color: palette.textMute, fontWeight: 400 }}>
                (cargando recetas...)
              </span>
            )}
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: palette.textBright, fontSize: 24, margin: "4px 0 0" }}>{modulo.apodo}</h2>
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10.5,
            padding: "4px 12px",
            borderRadius: 20,
            border: `1px solid ${hayDatosReales ? palette.good : palette.borderSoft}`,
            color: hayDatosReales ? palette.good : palette.textMute,
          }}
        >
          {hayDatosReales ? "● Datos en vivo" : "○ Datos de ejemplo"}
        </div>
      </div>

      <SelectorReceta
        recetas={recetas}
        recetaId={recetaId}
        onChange={(id) => {
          setRecetaId(id);
          guardarUltimaReceta(id);
        }}
        onCrear={async (datosReceta) => {
          const res = await fetch(`${API_BASE_URL}/recetas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...datosReceta, usuarioId }),
          });
          if (!res.ok) throw new Error("No se pudo guardar la receta");
          const data = await res.json();
          const nueva = apiRecetaToFrontend(data.receta);
          setRecetas((r) => [...r, nueva]);
          setRecetaId(nueva.id);
          guardarUltimaReceta(nueva.id);
        }}
      />

      {/* Métricas actuales */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <Metric label="Temp. Interna" valor={ultimo.tempInterna} unidad="°C" fueraMin={duraciones.tempInterna} color={palette.amber} />
        <Metric label="Temp. Externa" valor={ultimo.tempExterna} unidad="°C" fueraMin={duraciones.tempExterna} color={palette.blanco} />
        <Metric label="pH" valor={ultimo.ph} unidad="" fueraMin={duraciones.ph} color={palette.azulClaro} />
        <Metric label="Densidad" valor={ultimo.densidad.toFixed(3)} unidad="SG" fueraMin={duraciones.densidad} color={palette.good} />
      </div>

      {/* Filtros de la gráfica + selector de rango de horas (FIX #3) */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(METRICAS).map(([id, m]) => (
            <BotonFiltro key={id} activo={filtro === id} label={m.label} color={m.color} onClick={() => setFiltro(id)} />
          ))}
        </div>
        <SelectorRango horas={horasVentana} onChange={setHorasVentana} />
      </div>

      <GraficaCombinada serie={serie} rangos={rangos} filtro={filtro} horasVentana={horasVentana} />

      <HistorialDia deviceId={modulo.deviceId} rangos={rangos} />
    </div>
  );
}

function Header({ onLogout }) {
  const [ahora, setAhora] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fecha = ahora.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const hora = ahora.toLocaleTimeString("es-MX", { hour12: false });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 28,
        paddingBottom: 18,
        borderBottom: `1px solid ${palette.border}`,
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      {/* Izquierda: logo + título */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <img
          src={LOGO_URL}
          alt="Logo"
          style={{ width: 46, height: 46, borderRadius: 6, objectFit: "cover", background: palette.bg }}
        />
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: "0.18em", color: palette.textMute }}>
            MONITOREO
          </div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: palette.textBright, fontWeight: 700, lineHeight: 1 }}>
            DESTILACIÓN
          </div>
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: palette.textDim, marginTop: 2 }}>
            Monitoreo de Fermentación · Operaciones en Vivo
          </div>
        </div>
      </div>

      {/* Derecha: fecha, hora, en vivo, salir */}
      <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, letterSpacing: "0.14em", color: palette.textMute }}>FECHA</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: palette.textLight }}>{fecha}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, letterSpacing: "0.14em", color: palette.textMute }}>HORA LOCAL</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: palette.textBright, fontWeight: 600 }}>{hora}</div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 20,
            border: `1px solid ${palette.good}`,
            background: `${palette.good}1a`,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: palette.good,
              boxShadow: `0 0 6px ${palette.good}`,
            }}
          />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: palette.good, letterSpacing: "0.05em" }}>
            EN VIVO
          </span>
        </div>
        <button
          onClick={onLogout}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            padding: "8px 18px",
            borderRadius: 4,
            border: `1px solid ${palette.border}`,
            background: "transparent",
            color: palette.textLight,
            cursor: "pointer",
          }}
        >
          Salir
        </button>
      </div>
    </div>
  );
}

export default function DestilacionDashboard({ usuario, onLogout }) {
  // FIX #2: la receta guardada del usuario (si existe) se usa como
  // valor inicial del módulo fijo — nada de sistema de vinculación,
  // solo se recupera un dato guardado en Usuarios.ultimaRecetaId.
  const modulos = [{
    id: "DEST-0001",
    deviceId: "esp32-destilacion",
    apodo: "Fermentador 1",
    recetaId: usuario?.ultimaRecetaId ?? null,
  }];

  return (
    <div style={{ minHeight: "100vh", background: palette.bg, fontFamily: "'IBM Plex Sans', sans-serif", padding: "28px 32px" }}>
      <Header onLogout={onLogout} />

      {modulos.map((m) => (
        <ModuloCard key={m.id} modulo={m} usuarioId={usuario?.id} />
      ))}

      <div style={{ textAlign: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: palette.textMute, marginTop: 12, letterSpacing: "0.08em" }}>
        DESTILACIÓN · Sistema de monitoreo IoT · UTT
      </div>
    </div>
  );
}
//3
