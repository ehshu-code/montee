import { ImageSelection } from "@/screens/types";
import { createContext, ReactNode, useState } from "react";

type ImageSelectionContextType = {
    imageSelection: ImageSelection[] | null;
    setImageSelection: (images: ImageSelection[] | null) => void;
};

export const ImageSelectionContext = createContext<ImageSelectionContextType>({
    imageSelection: null,
    setImageSelection: () => { },
});

export const ImageSelectionContextProvider = ({ children }: { children: ReactNode }) => {
    const [imageSelection, setImageSelection] = useState<ImageSelection[] | null>(null);

    return (
        <ImageSelectionContext.Provider value={{ imageSelection, setImageSelection }}>
            {children}
        </ImageSelectionContext.Provider>
    );
};
