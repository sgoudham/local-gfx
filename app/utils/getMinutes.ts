export default function (matchTime: MatchTime) {
  return matchTime.formatted.split(":")[0];
}