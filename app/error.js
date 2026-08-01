"use client";

export default function Error({ error, reset }) {
  return (
    <div style={{ minHeight: "100vh", background: "#1F3D2E", color: "#FAF6EE", padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Bir hata olustu</h1>
      <p style={{ fontSize: 13, color: "#FFD5D0", marginBottom: 16 }}>
        Bu ekrani ekran goruntusu alip Claude'a gonder - tam hata metnini goruyor olacak.
      </p>
      <div style={{ background: "#0D1A12", borderRadius: 8, padding: 14, marginBottom: 16, overflowX: "auto" }}>
        <p style={{ fontSize: 12, fontFamily: "monospace", whiteSpace: "pre-wrap", color: "#FF9A8A", margin: 0 }}>
          {error?.message || "Bilinmeyen hata"}
        </p>
        {error?.digest && (
          <p style={{ fontSize: 11, fontFamily: "monospace", color: "#8A9A8F", marginTop: 8 }}>
            digest: {error.digest}
          </p>
        )}
        {error?.stack && (
          <p style={{ fontSize: 10, fontFamily: "monospace", whiteSpace: "pre-wrap", color: "#6B8A76", marginTop: 8 }}>
            {error.stack}
          </p>
        )}
      </div>
      <button onClick={() => reset()} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#FF6B5E", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
        Tekrar Dene
      </button>
    </div>
  );
}
