import React, { useEffect, useRef } from 'react';

interface LatexRendererProps {
    children: string;
    className?: string;
}

declare global {
    interface Window {
        renderMathInElement?: (element: HTMLElement, options: any) => void;
    }
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ children, className = "" }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const renderMath = () => {
            if (containerRef.current && window.renderMathInElement) {
                try {
                    window.renderMathInElement(containerRef.current, {
                        delimiters: [
                            { left: "$$", right: "$$", display: true },
                            { left: "$", right: "$", display: false },
                            { left: "\\(", right: "\\)", display: false },
                            { left: "\\[", right: "\\]", display: true }
                        ],
                        throwOnError: false,
                        trust: true,
                        strict: false
                    });
                } catch (error) {
                    console.error("KaTeX rendering error:", error);
                }
            }
        };

        // Attempt immediate render
        if (window.renderMathInElement) {
            renderMath();
        } else {
            // Poll for KaTeX if not yet loaded (due to defer in index.html)
            const intervalId = setInterval(() => {
                if (window.renderMathInElement) {
                    renderMath();
                    clearInterval(intervalId);
                }
            }, 100);

            // Clear interval after 5 seconds to avoid infinite polling
            const timeoutId = setTimeout(() => {
                clearInterval(intervalId);
            }, 5000);

            return () => {
                clearInterval(intervalId);
                clearTimeout(timeoutId);
            };
        }
    }, [children]);

    return (
        <div
            ref={containerRef}
            className={`latex-container ${className}`}
        >
            {children}
        </div>
    );
};

export default LatexRenderer;
