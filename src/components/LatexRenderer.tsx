import React, { useEffect, useRef } from 'react';

interface LatexRendererProps {
    children: string;
    className?: string;
}

declare global {
    interface Window {
        renderMathInElement: (element: HTMLElement, options: any) => void;
    }
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ children, className = "" }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
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
