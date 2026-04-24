# Performance & Cleanup Plan

## In Progress
- [ ] Delete `apphosting.yaml` (Firebase App Hosting config, not needed for Vercel)
- [ ] Run `npm run build` to verify clean build for Vercel
- [ ] Add `GOOGLE_GENAI_API_KEY` to Vercel dashboard environment variables

## Done
- [x] Remove Indian AQI (CPCB) card from `src/app/page.tsx`
- [x] Optimize dashboard CSS for performance (reduce blur, shadows, transitions)
- [x] Remove "AI Insights" from `src/components/AppSidebar.tsx`
- [x] Optimize `src/app/layout.tsx` font loading with `display=swap`
- [x] Optimize `src/components/AqiProvider.tsx` by removing unnecessary `useMemo`
- [x] Optimize `next.config.ts` with production performance settings

