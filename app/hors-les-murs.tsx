import { useState } from 'react';
import { Alert, Image, Share, StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Carousel from '../components/Carousel';
import EventMap from '../components/EventMap';
import {
  AdminFAB,
  Button,
  Card,
  IconButton,
  Input,
  ScreenHeader,
  SectionLabel,
} from '../components/ui';
import { FieldLabel, FormModal } from '../components/admin/FormModal';
import { useAdmin } from '../lib/auth/AdminContext';
import { useCollection, type WithId } from '../lib/data/useCollection';
import { pickImage, uploadImage } from '../lib/media/upload';
import type { GalleryPhoto, NextEvent } from '../lib/content/types';
import { colors, radii, spacing, typography } from '../lib/theme';

const demoPhotos: WithId<GalleryPhoto>[] = [
  {
    id: 'demo-1',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    legende: 'Rencontre au marché de l’Horloge',
  },
  {
    id: 'demo-2',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    legende: 'Porte-à-porte dans le quartier du Plateau',
  },
];

const demoNextEvent: WithId<NextEvent> = {
  id: 'next',
  titre: 'Tractage au marché Carnot',
  date: new Date(Date.now() + 7 * 86400000).toISOString(),
  adresse: 'Place Carnot, 93230 Romainville',
  lat: 48.8805,
  lng: 2.4336,
  description: 'Venez nombreux échanger avec l’équipe autour d’un café !',
};

function emptyPhoto(): GalleryPhoto {
  return { imageUrl: '', legende: '' };
}

export default function HorsLesMursScreen() {
  const { isAdmin } = useAdmin();
  const gallery = useCollection<GalleryPhoto>('horsLesMurs_gallery', demoPhotos);
  const nextEvent = useCollection<NextEvent>('horsLesMurs_next', [demoNextEvent]);
  const event = nextEvent.items[0];

  const [photoModal, setPhotoModal] = useState(false);
  const [photoForm, setPhotoForm] = useState<GalleryPhoto>(emptyPhoto());
  const [picking, setPicking] = useState(false);

  const [eventModal, setEventModal] = useState(false);
  const [eventForm, setEventForm] = useState<NextEvent>(event ?? demoNextEvent);
  const [savingEvent, setSavingEvent] = useState(false);

  const handlePickPhoto = async () => {
    const uri = await pickImage();
    if (!uri) return;
    setPicking(true);
    try {
      const url = await uploadImage(uri, `hors-les-murs/${Date.now()}.jpg`);
      setPhotoForm((f) => ({ ...f, imageUrl: url }));
    } finally {
      setPicking(false);
    }
  };

  const submitPhoto = async () => {
    if (!photoForm.imageUrl) {
      Alert.alert('Photo requise', 'Choisissez une photo avant d’enregistrer.');
      return;
    }
    await gallery.add(photoForm);
    setPhotoForm(emptyPhoto());
    setPhotoModal(false);
  };

  const openEventModal = () => {
    setEventForm(event ?? demoNextEvent);
    setEventModal(true);
  };

  const submitEvent = async () => {
    setSavingEvent(true);
    try {
      if (event) await nextEvent.update(event.id, eventForm);
      else await nextEvent.add(eventForm);
      setEventModal(false);
    } finally {
      setSavingEvent(false);
    }
  };

  const shareEvent = () => {
    if (!event) return;
    const date = new Date(event.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    Share.share({
      message: `${event.titre} — ${date}\n${event.adresse}\n${event.description}\n\nRomainville à Venir`,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScreenHeader title="Hors les murs" subtitle="Nos rencontres sur le terrain" />
      <ScrollView contentContainerStyle={styles.content}>
        <SectionLabel>Nos derniers événements</SectionLabel>
        <Carousel
          photos={gallery.items}
          isAdmin={isAdmin}
          onDelete={(id) => gallery.remove(id)}
        />
        {isAdmin && (
          <Button
            label="Ajouter une photo"
            variant="outline"
            icon="camera-outline"
            onPress={() => {
              setPhotoForm(emptyPhoto());
              setPhotoModal(true);
            }}
            style={{ marginTop: spacing(3) }}
          />
        )}

        <View style={{ marginTop: spacing(7) }}>
          <View style={styles.rowBetween}>
            <SectionLabel>Prochain rendez-vous</SectionLabel>
            {isAdmin && <IconButton name="create-outline" onPress={openEventModal} />}
          </View>
          {event ? (
            <Card>
              <Text style={styles.eventTitre}>{event.titre}</Text>
              <View style={styles.eventMetaRow}>
                <Ionicons name="calendar-outline" size={15} color={colors.grey} />
                <Text style={styles.eventMeta}>
                  {new Date(event.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.eventMetaRow}>
                <Ionicons name="location-outline" size={15} color={colors.grey} />
                <Text style={styles.eventMeta}>{event.adresse}</Text>
              </View>
              {event.description ? <Text style={styles.eventDesc}>{event.description}</Text> : null}

              <View style={{ marginTop: spacing(4) }}>
                <EventMap lat={event.lat} lng={event.lng} adresse={event.adresse} />
              </View>

              <Button
                label="Partager"
                icon="share-social-outline"
                variant="ghost"
                onPress={shareEvent}
                style={{ marginTop: spacing(3) }}
              />
            </Card>
          ) : null}
        </View>
      </ScrollView>

      <FormModal
        visible={photoModal}
        title="Ajouter une photo"
        onClose={() => setPhotoModal(false)}
        onSubmit={submitPhoto}
      >
        <View>
          <FieldLabel>Photo</FieldLabel>
          {photoForm.imageUrl ? (
            <Image source={{ uri: photoForm.imageUrl }} style={styles.preview} />
          ) : null}
          <Button
            label={picking ? 'Chargement...' : 'Choisir une photo'}
            variant="outline"
            icon="image-outline"
            onPress={handlePickPhoto}
            loading={picking}
          />
        </View>
        <View>
          <FieldLabel>Légende</FieldLabel>
          <Input
            value={photoForm.legende}
            onChangeText={(t) => setPhotoForm((f) => ({ ...f, legende: t }))}
            placeholder="Ex : Rencontre au marché de l’Horloge"
          />
        </View>
      </FormModal>

      <FormModal
        visible={eventModal}
        title="Prochain rendez-vous"
        onClose={() => setEventModal(false)}
        onSubmit={submitEvent}
        submitting={savingEvent}
      >
        <View>
          <FieldLabel>Titre</FieldLabel>
          <Input
            value={eventForm.titre}
            onChangeText={(t) => setEventForm((f) => ({ ...f, titre: t }))}
          />
        </View>
        <View>
          <FieldLabel>Adresse</FieldLabel>
          <Input
            value={eventForm.adresse}
            onChangeText={(t) => setEventForm((f) => ({ ...f, adresse: t }))}
          />
        </View>
        <View style={styles.coordsRow}>
          <View style={{ flex: 1 }}>
            <FieldLabel>Latitude</FieldLabel>
            <Input
              value={String(eventForm.lat)}
              keyboardType="numeric"
              onChangeText={(t) => setEventForm((f) => ({ ...f, lat: Number(t) || 0 }))}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FieldLabel>Longitude</FieldLabel>
            <Input
              value={String(eventForm.lng)}
              keyboardType="numeric"
              onChangeText={(t) => setEventForm((f) => ({ ...f, lng: Number(t) || 0 }))}
            />
          </View>
        </View>
        <View>
          <FieldLabel>Date et heure (JJ/MM/AAAA HH:MM)</FieldLabel>
          <Input
            value={new Date(eventForm.date).toLocaleString('fr-FR').slice(0, 17)}
            onChangeText={() => {}}
            editable={false}
          />
          <Text style={styles.dateHint}>
            Astuce : modifiez la date depuis la console d’administration pour plus de précision.
          </Text>
        </View>
        <View>
          <FieldLabel>Description</FieldLabel>
          <Input
            multiline
            value={eventForm.description}
            onChangeText={(t) => setEventForm((f) => ({ ...f, description: t }))}
          />
        </View>
      </FormModal>

      {isAdmin && <AdminFAB onPress={() => setPhotoModal(true)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing(5), paddingBottom: spacing(16) },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventTitre: { fontFamily: typography.heading, fontSize: 17, color: colors.ink },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    marginTop: spacing(2),
  },
  eventMeta: { fontFamily: typography.body, fontSize: 12.5, color: colors.grey, textTransform: 'capitalize' },
  eventDesc: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.ink,
    marginTop: spacing(3),
    lineHeight: 19,
  },
  preview: {
    width: '100%',
    height: 140,
    borderRadius: radii.md,
    marginBottom: spacing(3),
    backgroundColor: colors.greyLight,
  },
  coordsRow: { flexDirection: 'row', gap: spacing(3) },
  dateHint: { fontFamily: typography.body, fontSize: 11, color: colors.grey, marginTop: spacing(1) },
});
