"use client"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { useRef } from "react"
import { cn } from "@/lib/utils";

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

    useGSAP(() => {
        if (!containerRef.current) return;

        const element = containerRef.current;
        const childNodes = Array.from(element.childNodes);
        element.innerHTML = "";
        
        const lines: HTMLElement[] = [];
        const blocks: HTMLElement[] = [];

        childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
              return;
            }

            const wrapper = document.createElement("div");
            wrapper.style.position = "relative";
            wrapper.style.display = "inline-block";
            wrapper.style.overflow = "hidden";
            if (node.nodeType !== Node.TEXT_NODE && (node as HTMLElement).tagName === "BR") {
                 element.appendChild(node);
                 return;
            }
            
            //revealer Block
            const block = document.createElement("div");
            block.style.position = "absolute";
            block.style.top = "0";
            block.style.left = "0";
            block.style.width = "100%";
            block.style.height = "100%";
            block.style.backgroundColor = blockColor;
            block.style.zIndex = "2";
            block.style.transform = "scaleX(0)";
            block.style.transformOrigin = "left center";
            
            const contentSpan = document.createElement("span");
            contentSpan.style.opacity = "0";
            contentSpan.style.display = "inline-block";
            contentSpan.appendChild(node.cloneNode(true));
            
            wrapper.appendChild(contentSpan);
            wrapper.appendChild(block);
            element.appendChild(wrapper);
            
            if (node.nodeType !== Node.TEXT_NODE && getComputedStyle((node as HTMLElement)).display === "block") {
               wrapper.style.display = "block";
            } else {
               wrapper.style.display = "inline-flex";
               wrapper.style.marginRight = "0.25em";
            }

            lines.push(contentSpan);
            blocks.push(block);
        });

        //master Timeline
        const tl = gsap.timeline({
            defaults: { ease: "expo.inOut" },
            scrollTrigger: animateOnScroll ? {
                trigger: containerRef.current,
                start: "top 85%", 
                toggleActions: "play none none reverse", 
            } : undefined,
            delay: delay
        });

        //animation sequence
        tl.to(blocks, {
            scaleX: 1,
            duration: duration,
            stagger: stagger,
            transformOrigin: "left center",
        })
        .set(lines, {
            opacity: 1,
            stagger: stagger
        }, `<${duration / 2}`) 
        // Scale Block 1 -> 0 (Left to Right)
        .to(blocks, {
            scaleX: 0,
            duration: duration,
            stagger: stagger,
            transformOrigin: "right center"
        }, `<${duration * 0.4}`); 



    }, { 
        scope: containerRef, 
        dependencies: [animateOnScroll, delay, blockColor, stagger, duration] 
    });
    
    return (
        <div ref={containerRef} style={{ position: "relative" }}>
            {children}
        </div>
    );
}
