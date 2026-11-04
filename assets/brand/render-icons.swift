// Renders every SuperFin icon PNG from one geometry (unit square, y down).
// Usage: swift render.swift <outDir>
import AppKit
import CoreGraphics
import Foundation

let outDir = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "."

// MARK: - Palette
let violet = CGColor(srgbRed: 0x04 / 255, green: 0x78 / 255, blue: 0x57 / 255, alpha: 1)
let magenta = CGColor(srgbRed: 0x10 / 255, green: 0xB9 / 255, blue: 0x81 / 255, alpha: 1)
let white = CGColor(srgbRed: 1, green: 1, blue: 1, alpha: 1)

// MARK: - Geometry (unit square, origin top-left, y down)

/// Rounded play triangle.
func playTriangle(in r: CGRect) -> CGPath {
    func p(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: r.minX + x * r.width, y: r.minY + y * r.height) }
    let a = p(0.24, 0.15), b = p(0.24, 0.85), c = p(0.86, 0.50)
    let radius = 0.075 * r.width
    let path = CGMutablePath()
    let mid = CGPoint(x: (a.x + b.x) / 2, y: (a.y + b.y) / 2)
    path.move(to: mid)
    path.addArc(tangent1End: b, tangent2End: c, radius: radius)
    path.addArc(tangent1End: c, tangent2End: a, radius: radius)
    path.addArc(tangent1End: a, tangent2End: b, radius: radius)
    path.closeSubpath()
    return path
}

// MARK: - Drawing

func makeContext(_ w: Int, _ h: Int) -> CGContext {
    let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0,
                        space: CGColorSpace(name: CGColorSpace.sRGB)!,
                        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    // y down, like the geometry
    ctx.translateBy(x: 0, y: CGFloat(h))
    ctx.scaleBy(x: 1, y: -1)
    return ctx
}

func fillGradient(_ ctx: CGContext, _ rect: CGRect) {
    let g = CGGradient(colorsSpace: CGColorSpace(name: CGColorSpace.sRGB), colors: [violet, magenta] as CFArray, locations: [0, 1])!
    ctx.drawLinearGradient(g, start: CGPoint(x: rect.minX, y: rect.minY), end: CGPoint(x: rect.maxX, y: rect.maxY), options: [.drawsBeforeStartLocation, .drawsAfterEndLocation])
}

let deepViolet = CGColor(srgbRed: 0x06 / 255, green: 0x4E / 255, blue: 0x3B / 255, alpha: 1)
let lilac = CGColor(srgbRed: 0x34 / 255, green: 0xD3 / 255, blue: 0x99 / 255, alpha: 1)
let pink = CGColor(srgbRed: 0xA3 / 255, green: 0xE6 / 255, blue: 0x35 / 255, alpha: 1)

func linear(_ ctx: CGContext, _ a: CGColor, _ b: CGColor, from p0: CGPoint, to p1: CGPoint) {
    let g = CGGradient(colorsSpace: CGColorSpace(name: CGColorSpace.sRGB), colors: [a, b] as CFArray, locations: [0, 1])!
    ctx.drawLinearGradient(g, start: p0, end: p1, options: [.drawsBeforeStartLocation, .drawsAfterEndLocation])
}

/// The two layers: a large back triangle and a smaller front one set to its
/// right, overlapping it, as two screens stacked.
func backBox(_ r: CGRect) -> CGRect { CGRect(x: r.minX, y: r.minY, width: r.width * 0.86, height: r.height * 0.86).offsetBy(dx: 0, dy: r.height * 0.07) }
func frontBox(_ r: CGRect) -> CGRect { CGRect(x: r.minX + r.width * 0.30, y: r.minY + r.height * 0.22, width: r.width * 0.56, height: r.height * 0.56) }

/// Colour glyph: two glass layers. The front one is translucent, so the back
/// one reads through it, with a sheen across its top and a light rim.
func glassSheen(_ ctx: CGContext, _ path: CGPath, _ box: CGRect, strength: CGFloat) {
    ctx.saveGState(); ctx.addPath(path); ctx.clip()
    let top = CGColor(srgbRed: 1, green: 1, blue: 1, alpha: 0.55 * strength)
    let clear = CGColor(srgbRed: 1, green: 1, blue: 1, alpha: 0)
    linear(ctx, top, clear, from: CGPoint(x: box.minX, y: box.minY), to: CGPoint(x: box.minX + box.width * 0.35, y: box.minY + box.height * 0.55))
    ctx.restoreGState()
    // Rim light: a thin inner stroke, brighter at the top left.
    ctx.saveGState(); ctx.addPath(path); ctx.clip()
    ctx.addPath(path); ctx.setLineWidth(box.width * 0.035); ctx.replacePathWithStrokedPath(); ctx.clip()
    linear(ctx, CGColor(srgbRed: 1, green: 1, blue: 1, alpha: 0.7 * strength), CGColor(srgbRed: 1, green: 1, blue: 1, alpha: 0.08),
           from: CGPoint(x: box.minX, y: box.minY), to: CGPoint(x: box.maxX, y: box.maxY))
    ctx.restoreGState()
}

/// Three glass panes, each smaller and lighter, cascading to the right.
struct Pane { let box: (CGRect) -> CGRect; let from: CGColor; let to: CGColor; let alpha: CGFloat; let sheen: CGFloat }
func c(_ hex: UInt32) -> CGColor {
    CGColor(srgbRed: CGFloat((hex >> 16) & 0xFF) / 255, green: CGFloat((hex >> 8) & 0xFF) / 255, blue: CGFloat(hex & 0xFF) / 255, alpha: 1)
}
// Staggered like a fast-forward button. The x offsets are shifted left so
// the whole run, not one triangle, sits centred in the glyph box.
func pane(_ x: CGFloat, _ size: CGFloat) -> (CGRect) -> CGRect {
    { r in CGRect(x: r.minX + r.width * x, y: r.minY + r.height * (1 - size) / 2, width: r.width * size, height: r.height * size) }
}
let panes: [Pane] = [
    Pane(box: pane(-0.10, 0.66), from: c(0x064E3B), to: c(0x059669), alpha: 1, sheen: 0.45),
    Pane(box: pane(0.15, 0.60), from: c(0x10B981), to: c(0x34D399), alpha: 0.8, sheen: 0.75),
    Pane(box: pane(0.38, 0.54), from: c(0x6EE7B7), to: c(0xBEF264), alpha: 0.85, sheen: 1),
]

func drawGlyph(_ ctx: CGContext, in r: CGRect) {
    // Soft glow behind the stack.
    let glow = CGGradient(colorsSpace: CGColorSpace(name: CGColorSpace.sRGB),
                          colors: [CGColor(srgbRed: 0.2, green: 0.83, blue: 0.6, alpha: 0.35), CGColor(srgbRed: 0.2, green: 0.83, blue: 0.6, alpha: 0)] as CFArray,
                          locations: [0, 1])!
    let center = CGPoint(x: r.midX, y: r.midY)
    ctx.drawRadialGradient(glow, startCenter: center, startRadius: 0, endCenter: center, endRadius: r.width * 0.62, options: [])
    for (i, pane) in panes.enumerated() {
        let box = pane.box(r)
        let path = playTriangle(in: box)
        if i > 0 {
            ctx.saveGState()
            ctx.setShadow(offset: CGSize(width: -r.width * 0.012, height: r.height * 0.018), blur: r.width * 0.06,
                          color: CGColor(srgbRed: 0, green: 0.05, blue: 0.03, alpha: 0.6))
            ctx.addPath(path); ctx.setFillColor(CGColor(srgbRed: 0, green: 0, blue: 0, alpha: 0.22)); ctx.fillPath()
            ctx.restoreGState()
        }
        ctx.saveGState(); ctx.addPath(path); ctx.clip(); ctx.setAlpha(pane.alpha)
        linear(ctx, pane.from, pane.to, from: CGPoint(x: box.minX, y: box.minY), to: CGPoint(x: box.maxX, y: box.maxY))
        ctx.restoreGState()
        glassSheen(ctx, path, box, strength: pane.sheen)
    }
}

/// One-colour glyph (notification, themed): the back triangle with the front
/// one drawn as a gap, so the layering still reads.
func drawFlatGlyph(_ ctx: CGContext, in r: CGRect, color: CGColor) {
    ctx.addPath(playTriangle(in: panes[0].box(r))); ctx.setFillColor(color); ctx.fillPath()
    for pane in panes.dropFirst() {
        ctx.saveGState()
        ctx.addPath(playTriangle(in: pane.box(r)))
        ctx.setBlendMode(.clear); ctx.setLineWidth(r.width * 0.04); ctx.strokePath()
        ctx.restoreGState()
    }
}

func save(_ ctx: CGContext, _ name: String, opaque: Bool = false) {
    var image = ctx.makeImage()!
    if opaque {
        // Re-render without alpha (App Store icons must not have it).
        let w = image.width, h = image.height
        let flat = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0,
                             space: CGColorSpace(name: CGColorSpace.sRGB)!,
                             bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
        flat.draw(image, in: CGRect(x: 0, y: 0, width: w, height: h))
        image = flat.makeImage()!
    }
    let rep = NSBitmapImageRep(cgImage: image)
    let data = rep.representation(using: .png, properties: [:])!
    try! data.write(to: URL(fileURLWithPath: "\(outDir)/\(name)"))
    print("wrote \(name) \(image.width)x\(image.height)")
}

/// A square glyph box centred in a canvas, `fraction` of the shorter side.
func glyphBox(_ w: CGFloat, _ h: CGFloat, fraction: CGFloat, dx: CGFloat = 0) -> CGRect {
    let s = min(w, h) * fraction
    // The triangle's centroid sits at x 0.447 of its box: shift so it is centred.
    return CGRect(x: (w - s) / 2 + s * 0.053 + dx, y: (h - s) / 2, width: s, height: s)
}

func wordmark(_ ctx: CGContext, text: String, x: CGFloat, centerY: CGFloat, size: CGFloat) {
    // Drawn through AppKit in a flipped graphics context.
    let ns = NSGraphicsContext(cgContext: ctx, flipped: true)
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = ns
    let font = NSFont.systemFont(ofSize: size, weight: .heavy)
    let attrs: [NSAttributedString.Key: Any] = [.font: font, .foregroundColor: NSColor.white, .kern: -size * 0.02]
    let str = NSAttributedString(string: text, attributes: attrs)
    let bounds = str.size()
    str.draw(at: CGPoint(x: x, y: centerY - bounds.height / 2))
    NSGraphicsContext.restoreGraphicsState()
}

// MARK: - Outputs

let bgTop = CGColor(srgbRed: 0x12 / 255, green: 0x20 / 255, blue: 0x19 / 255, alpha: 1)
let bgBottom = CGColor(srgbRed: 0x0A / 255, green: 0x12 / 255, blue: 0x0E / 255, alpha: 1)
func darkBackground(_ ctx: CGContext, _ w: CGFloat, _ h: CGFloat) {
    linear(ctx, bgTop, bgBottom, from: .zero, to: CGPoint(x: 0, y: h))
}

do {
    let ctx = makeContext(1024, 1024)
    darkBackground(ctx, 1024, 1024)
    drawGlyph(ctx, in: glyphBox(1024, 1024, fraction: 0.8))
    save(ctx, "icon.png", opaque: true)
}
do {
    let ctx = makeContext(1024, 1024)
    drawGlyph(ctx, in: glyphBox(1024, 1024, fraction: 0.96))
    save(ctx, "icon-ios-plain.png")
}
do {
    let ctx = makeContext(1024, 1024)
    drawGlyph(ctx, in: glyphBox(1024, 1024, fraction: 0.6))
    save(ctx, "icon-android-plain.png")
}
do {
    let ctx = makeContext(1024, 1024)
    drawFlatGlyph(ctx, in: glyphBox(1024, 1024, fraction: 0.6), color: white)
    save(ctx, "icon-android-themed.png")
}
do {
    let ctx = makeContext(96, 96)
    drawFlatGlyph(ctx, in: glyphBox(96, 96, fraction: 1.05), color: white)
    save(ctx, "notification.png")
}
func tv(_ name: String, _ w: Int, _ h: Int, wordmark text: Bool) {
    let ctx = makeContext(w, h); let W = CGFloat(w), H = CGFloat(h)
    darkBackground(ctx, W, H)
    if text {
        let s = H * 0.6, gap = s * 0.1, fontSize = s * 0.5
        let tw = NSAttributedString(string: "SuperFin", attributes: [.font: NSFont.systemFont(ofSize: fontSize, weight: .heavy)]).size().width
        let x0 = (W - (s + gap + tw)) / 2
        drawGlyph(ctx, in: CGRect(x: x0, y: (H - s) / 2, width: s, height: s))
        wordmark(ctx, text: "SuperFin", x: x0 + s + gap, centerY: H / 2, size: fontSize)
    } else {
        drawGlyph(ctx, in: glyphBox(W, H, fraction: 0.72))
    }
    save(ctx, name, opaque: true)
}
tv("icon-tvos.png", 1280, 768, wordmark: false)
tv("icon-tvos-small.png", 400, 240, wordmark: false)
tv("icon-tvos-small-2x.png", 800, 480, wordmark: false)
tv("icon-tvos-topshelf.png", 1920, 720, wordmark: true)
tv("icon-tvos-topshelf-2x.png", 3840, 1440, wordmark: true)
tv("icon-tvos-topshelf-wide.png", 2320, 720, wordmark: true)
tv("icon-tvos-topshelf-wide-2x.png", 4640, 1440, wordmark: true)
