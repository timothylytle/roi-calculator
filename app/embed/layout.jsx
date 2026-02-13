import IframeResizerChild from './IframeResizerChild';

export default function EmbedLayout({ children }) {
  return (
    <>
      <IframeResizerChild />
      {children}
    </>
  );
}
