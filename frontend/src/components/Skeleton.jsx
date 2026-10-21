export const Skeleton = ({ h = 16, w = '100%', style }) => <div className="skel" style={{ height: h, width: w, ...style }} />;
export function PageSkeleton() {
  return (
    <div className="stack" aria-busy="true" aria-label="Loading">
      <Skeleton h={120} style={{ borderRadius: 16 }} />
      <div className="grid g4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={84} />)}</div>
      <Skeleton h={220} />
    </div>
  );
}
