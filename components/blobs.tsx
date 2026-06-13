/**
 * Soft, blurred gradient orbs sitting behind glass cards to add colour and
 * depth without darkening the page. Purely decorative.
 */
export function Blobs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="blob -left-24 -top-24 h-[28rem] w-[28rem] bg-gold-300/40 animate-float" />
      <div
        className="blob right-[-8rem] top-10 h-[26rem] w-[26rem] bg-indigo-200/50 animate-float"
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="blob bottom-[-10rem] left-1/3 h-[30rem] w-[30rem] bg-gold-200/40 animate-float"
        style={{ animationDelay: "-8s" }}
      />
    </div>
  );
}
