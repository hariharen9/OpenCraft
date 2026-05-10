import { useRef } from "react";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { X, Images } from "lucide-react";

export function GalleryView({ node, updateAttributes, selected }: NodeViewProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const images: string[] = node.attrs.images || [];

  const handleAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImgs = [...images];
    for (let i = 0; i < files.length; i++) {
        const fd = await files[i].arrayBuffer();
        const base64 = btoa(new Uint8Array(fd).reduce((s, b) => s + String.fromCharCode(b), ""));
        newImgs.push(`data:${files[i].type};base64,${base64}`);
    }
    updateAttributes({ images: newImgs });
    if (fileRef.current) fileRef.current.value = "";
  }

  const removeImg = (index: number) => {
    const newImgs = [...images];
    newImgs.splice(index, 1);
    updateAttributes({ images: newImgs });
  }

  return (
    <NodeViewWrapper
      data-type="gallery"
      className={`my-4 rounded-xl border ${selected ? 'border-[#4cc2ff] ring-1 ring-[#4cc2ff]' : 'border-[#333]'} bg-[#1a1a1a] shadow-sm transition-all overflow-hidden p-4`}
    >
        <div className="mb-4 flex items-center justify-between text-[11px] text-[#666]">
            <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[#4cc2ff]">
              <Images className="h-3.5 w-3.5" /> Image Gallery
            </span>
            <button onClick={() => fileRef.current?.click()} className="text-[#4cc2ff] hover:text-[#7b9eff] font-medium">Add Images</button>
            <input type="file" multiple ref={fileRef} className="hidden" accept="image/*" onChange={handleAdd} />
        </div>
        
        {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#333] rounded-lg bg-[#222]">
                <p className="text-[#666] text-[13px] mb-3">No images in gallery</p>
                <button onClick={() => fileRef.current?.click()} className="px-4 py-1.5 bg-[#333] hover:bg-[#444] text-[#e0e0e0] rounded-md text-[12px] font-medium transition-colors">Browse Files</button>
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {images.map((img, i) => (
                    <div key={i} className="relative group aspect-square rounded-md overflow-hidden bg-[#222] ring-1 ring-[#333]">
                        <img src={img} className="object-cover w-full h-full" alt="" />
                        <button 
                            onClick={() => removeImg(i)} 
                            className="absolute top-1.5 right-1.5 bg-black/70 p-1 rounded text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        )}
    </NodeViewWrapper>
  )
}
