import AppKit

struct CalloutPlacement {
    /// Preferred anchor edge for a directional hint name; MinY places the popup above the anchor in screen space.
    static func edge(for hint: String) -> NSRectEdge {
        if hint.hasPrefix("left") { return .minX }
        if hint.hasPrefix("right") { return .maxX }
        if hint.hasPrefix("top") { return .minY }
        return .maxY
    }

    static func frame(anchor: NSRect, size: NSSize, workArea: NSRect,
                      hint: String, gap: CGFloat, rtl: Bool) -> NSRect {
        let preferred = Self.edge(for: hint)
        func origin(_ edge: NSRectEdge) -> NSPoint {
            let horizontal = edge == .minY || edge == .maxY
            let centered = hint.hasSuffix("Center")
            let trailing = horizontal ? hint.hasSuffix("RightEdge") : hint.hasSuffix("BottomEdge")
            let x = centered ? anchor.midX - size.width / 2 :
                trailing ? anchor.maxX - size.width :
                (hint.isEmpty && rtl ? anchor.maxX - size.width : anchor.minX)
            let y = centered ? anchor.midY - size.height / 2 :
                trailing ? anchor.minY : anchor.maxY - size.height
            switch edge {
            case .minX: return NSPoint(x: anchor.minX - size.width - gap, y: y)
            case .maxX: return NSPoint(x: anchor.maxX + gap, y: y)
            case .minY: return NSPoint(x: x, y: anchor.maxY + gap)
            case .maxY: return NSPoint(x: x, y: anchor.minY - size.height - gap)
            @unknown default: preconditionFailure("Unknown Callout edge")
            }
        }
        var frame = NSRect(origin: origin(preferred), size: size)
        let opposite: NSRectEdge = preferred == .minX ? .maxX : preferred == .maxX ? .minX : preferred == .minY ? .maxY : .minY
        let alternate = NSRect(origin: origin(opposite), size: size)
        let area = frame.intersection(workArea)
        let alternateArea = alternate.intersection(workArea)
        if !workArea.contains(frame) &&
            alternateArea.width * alternateArea.height > area.width * area.height {
            frame = alternate
        }
        frame.origin.x = max(workArea.minX, min(frame.minX, workArea.maxX - size.width))
        frame.origin.y = max(workArea.minY, min(frame.minY, workArea.maxY - size.height))
        return frame
    }
}
