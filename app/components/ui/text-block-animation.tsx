"use client"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { useRef, useState, useEffect } from "react"

// Ensure plugins are registered
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function TextBlockAnimation({
    children,
    animateOnScroll = true,
    delay = 0,
    blockColor = "var(--theme-text-accent)",
    stagger = 0.1,
    duration = 0.6
}: {
    children: React.ReactNode,
    animateOnScroll?: boolean,
    delay?: number,
    blockColor?: string,
    stagger?: number,
    duration?: number
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isSplit, setIsSplit] = useState(false);

    // 1. Initial splitting — do this once on mount
    useEffect(() => {
        if (!containerRef.current || isSplit) return;

        const element = containerRef.current;
        const originalNodes = Array.from(element.childNodes);
        
        // Preserve a copy of original HTML for cleanup if needed, 
        // though usually we want to keep the split version for performance.
        element.innerHTML = "";
        
        originalNodes.forEach((node) => {
            // Only process non-empty text or element nodes
            if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) return;

            // Edge case: <br/> doesn't need wrapping
            if (node.nodeType !== Node.TEXT_NODE && (node as HTMLElement).tagName === "BR") {
                 element.appendChild(node.cloneNode(true));
                 return;
            }

            const wrapper = document.createElement("div");
            wrapper.className = "tba-wrapper";
            wrapper.style.position = "relative";
            wrapper.style.overflow = "hidden";
            wrapper.style.display = "inline-flex";
            wrapper.style.verticalAlign = "top";
            wrapper.style.marginRight = "0.25em";

            // If it's a block element, expand it
            if (node.nodeType !== Node.TEXT_NODE) {
                const styles = window.getComputedStyle(node as HTMLElement);
                if (styles.display === "block") {
                    wrapper.style.display = "block";
                    wrapper.style.marginRight = "0";
                }
            }

            // Create the content span (start hidden)
            const contentSpan = document.createElement("span");
            contentSpan.className = "tba-content";
            contentSpan.style.opacity = "0";
            contentSpan.style.display = "inline-block";
            contentSpan.appendChild(node.cloneNode(true));

            // Create the block revealer
            const block = document.createElement("div");
            block.className = "tba-block";
            block.style.position = "absolute";
            block.style.top = "0";
            block.style.left = "0";
            block.style.width = "100%";
            block.style.height = "100%";
            block.style.backgroundColor = blockColor;
            block.style.zIndex = "2";
            block.style.transform = "scaleX(0)";
            block.style.transformOrigin = "left center";

            wrapper.appendChild(contentSpan);
            wrapper.appendChild(block);
            element.appendChild(wrapper);
        });

        setIsSplit(true);
    }, [blockColor, isSplit]);

    // 2. Animation timeline
    useGSAP(() => {
        if (!isSplit || !containerRef.current) return;

        const blocks = containerRef.current.querySelectorAll(".tba-block");
        const contents = containerRef.current.querySelectorAll(".tba-content");

        if (!blocks.length) return;

        const tl = gsap.timeline({
            defaults: { ease: "expo.inOut" },
            scrollTrigger: animateOnScroll ? {
                trigger: containerRef.current,
                start: "top 90%", // Trigger slightly later so we don't miss it
                toggleActions: "play none none reverse",
            } : undefined,
            delay: delay
        });

        // Animation Sequence
        tl.to(blocks, {
            scaleX: 1,
            duration: duration,
            stagger: stagger,
            transformOrigin: "left center",
        })
        .set(contents, {
            opacity: 1,
        }, `<${duration / 2}`) 
        .to(blocks, {
            scaleX: 0,
            duration: duration,
            stagger: stagger,
            transformOrigin: "right center"
        }, `<${duration * 0.4}`);

    }, { 
        scope: containerRef, 
        dependencies: [isSplit, animateOnScroll, delay, stagger, duration] 
    });
    
    // Initial render is the plain layout to avoid hydration mismatch
    // The splitting logic runs immediately after mounting.
    return (
        <div 
            ref={containerRef} 
            className="relative"
            style={{ 
                // Don't show original text for a split second while we split it
                // but keep the space to avoid shift. This is the compromise.
                visibility: isSplit ? "visible" : "hidden" 
            }}
        >
            {children}
        </div>
    );
}
