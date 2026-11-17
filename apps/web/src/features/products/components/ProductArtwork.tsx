import { Box } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

const PRODUCT_ART = [
  { background: 'linear-gradient(145deg, #e9e7d9, #c9d5c4)', color: '#315b48' },
  { background: 'linear-gradient(145deg, #f4e3d3, #e5bca0)', color: '#955d42' },
  { background: 'linear-gradient(145deg, #dce8e5, #a7c9bd)', color: '#376b61' },
  { background: 'linear-gradient(145deg, #eee5ce, #dfc58f)', color: '#81652d' },
] as const;

function getArtIndex(seed: string): number {
  let hash = 0;
  for (const character of seed) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return hash % PRODUCT_ART.length;
}

type ProductArtworkProps = {
  seed: string;
  height: number;
};

export function ProductArtwork({ seed, height }: ProductArtworkProps) {
  const art = PRODUCT_ART[getArtIndex(seed)] ?? PRODUCT_ART[0];

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        height,
        borderRadius: 3.5,
        background: art.background,
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '72%',
          aspectRatio: '1',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.48)',
        },
      }}
    >
      <Box
        sx={{
          width: 124,
          height: 145,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '32px 32px 42px 42px',
          color: art.color,
          bgcolor: 'rgba(255,255,255,0.44)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 18px 34px rgba(36, 50, 40, 0.12)',
          transform: 'rotate(-5deg)',
        }}
      >
        <Inventory2OutlinedIcon sx={{ fontSize: 58, strokeWidth: 1 }} />
      </Box>
    </Box>
  );
}
