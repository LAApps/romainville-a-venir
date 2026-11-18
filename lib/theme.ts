// Charte graphique extraite du programme municipal "Romainville à Venir"
export const colors = {
  navy: '#1B4965',
  navyLight: '#436A83',
  navyDark: '#122F42',
  coral: '#ED5D5C',
  coralDark: '#D94A49',
  white: '#FFFFFF',
  offWhite: '#F4F7F9',
  ink: '#152633',
  grey: '#6B7C88',
  greyLight: '#E3E9ED',
  success: '#2E8B57',
  border: '#D9E2E8',
} as const;

export const gradients = {
  hero: [colors.navy, colors.navyLight] as const,
};

export const typography = {
  heading: 'Poppins_800ExtraBold',
  headingBold: 'Poppins_700Bold',
  subheading: 'Poppins_600SemiBold',
  body: 'Montserrat_400Regular',
  bodyMedium: 'Montserrat_500Medium',
  bodySemiBold: 'Montserrat_600SemiBold',
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const spacing = (n: number) => n * 4;

export const shadow = {
  card: {
    shadowColor: '#0B2436',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
};
