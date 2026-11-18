import { ScrollView, View } from 'react-native';
import { ScreenHeader } from '../../components/ui';
import AdhesionForm from '../../components/forms/AdhesionForm';
import { colors, spacing } from '../../lib/theme';

export default function AdhesionScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScreenHeader
        title="Adhésion"
        subtitle="Rejoignez Romainville à Venir"
        onBack={false}
      />
      <ScrollView contentContainerStyle={{ padding: spacing(5), paddingBottom: spacing(16) }}>
        <AdhesionForm />
      </ScrollView>
    </View>
  );
}
