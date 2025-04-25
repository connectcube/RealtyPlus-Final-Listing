export default function formatViewCount(viewCount: number): string {
  if (viewCount < 1000) {
    return viewCount.toString();
  } else if (viewCount < 1000000) {
    return (viewCount / 1000).toFixed(1) + "K";
  } else {
    return (viewCount / 1000000).toFixed(1) + "M";
  }
}
