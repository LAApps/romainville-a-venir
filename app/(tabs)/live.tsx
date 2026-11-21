import { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import {
  AdminFAB,
  Badge,
  Button,
  Card,
  CheckboxRow,
  EmptyState,
  IconButton,
  Input,
  ScreenHeader,
  SectionLabel,
} from '../../components/ui';
import { FieldLabel, FormModal } from '../../components/admin/FormModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useAdmin } from '../../lib/auth/AdminContext';
import { useCollection, type WithId } from '../../lib/data/useCollection';
import { useDocument } from '../../lib/data/useDocument';
import { useHighlightSync } from '../../lib/content/useHighlightSync';
import type { LiveStatus, ProchainConseil, Publication } from '../../lib/content/types';
import { extractYoutubeId, getYoutubeEmbedUrl, getYoutubeThumbnail } from '../../lib/content/youtube';
import { colors, radii, spacing, typography } from '../../lib/theme';

const CHANNEL_STREAMS_URL = 'https://www.youtube.com/@villederomainville2180/streams';

const demoPublications: WithId<Publication>[] = [
  {
    id: 'demo-1',
    titre: 'Conseil municipal du 15 octobre 19h00',
    url: 'https://www.youtube.com/live/lqJy61xiKCI',
    date: '2026-10-15T19:00:00',
  },
  {
    id: 'demo-2',
    titre: 'Conseil municipal du 25 juin 19h00',
    url: 'https://www.youtube.com/live/_3lz5QQaA-A',
    date: '2026-06-25T19:00:00',
  },
  {
    id: 'demo-3',
    titre: 'Conseil Municipal du 2 avril 19h00',
    url: 'https://www.youtube.com/live/NG7q8arZpZE',
    date: '2026-04-02T19:00:00',
  },
  {
    id: 'demo-4',
    titre: "Conseil Municipal d'installation du 27 mars 17h30",
    url: 'https://www.youtube.com/live/TOhcEWa6OxE',
    date: '2026-03-27T17:30:00',
  },
];

const demoLiveStatus: LiveStatus = { enDirect: false, url: '' };
const demoProchainConseil: ProchainConseil = { date: '' };

function emptyPublication(): Publication {
  return { titre: '', url: '', date: new Date().toISOString() };
}

export default function LiveScreen() {
  const { isAdmin } = useAdmin();
  const { items: publications, add, update, remove } = useCollection<Publication>(
    'conseilMunicipalPublications',
    demoPublications,
    'date'
  );
  const liveStatus = useDocument<LiveStatus>('liveStatus', 'conseilMunicipal', demoLiveStatus);
  const prochainConseil = useDocument<ProchainConseil>(
    'prochainConseil',
    'next',
    demoProchainConseil
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Publication>(emptyPublication());
  const [submitting, setSubmitting] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [misEnAvant, setMisEnAvant] = useState(false);
  const { isFeatured, syncHighlight } = useHighlightSync();

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyPublication());
    setMisEnAvant(false);
    setModalVisible(true);
  };

  const openEdit = (publication: WithId<Publication>) => {
    setEditingId(publication.id);
    setForm(publication);
    setMisEnAvant(isFeatured(`pub-${publication.id}`));
    setModalVisible(true);
  };

  const submit = async () => {
    if (!form.titre.trim() || !extractYoutubeId(form.url)) return;
    setSubmitting(true);
    try {
      let id = editingId;
      if (editingId) await update(editingId, form);
      else id = await add(form);
      await syncHighlight(`pub-${id}`, misEnAvant, {
        titre: form.titre,
        imageUrl: getYoutubeThumbnail(form.url) ?? '',
        rubriqueHref: '/live',
      });
      setModalVisible(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    setConfirmVisible(false);
    await remove(editingId);
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScreenHeader title="Conseil municipal" subtitle="En direct et en replay" />
      <ScrollView contentContainerStyle={styles.content}>
        <NextCouncilSection isAdmin={isAdmin} prochainConseil={prochainConseil} />
        <LiveSection isAdmin={isAdmin} liveStatus={liveStatus} />

        <View style={{ marginTop: spacing(7) }}>
          <SectionLabel>Replays et publications</SectionLabel>
          {publications.length === 0 && (
            <EmptyState icon="videocam-outline" text="Aucune publication pour le moment." />
          )}
          {publications.map((p) => (
            <PublicationCard
              key={p.id}
              publication={p}
              isAdmin={isAdmin}
              expanded={expandedId === p.id}
              onToggleExpand={() => setExpandedId(expandedId === p.id ? null : p.id)}
              onEdit={() => openEdit(p)}
            />
          ))}
        </View>
      </ScrollView>

      {isAdmin && <AdminFAB onPress={openCreate} />}

      <FormModal
        visible={modalVisible}
        title={editingId ? 'Modifier la publication' : 'Nouvelle publication'}
        onClose={() => setModalVisible(false)}
        onSubmit={submit}
        onDelete={editingId ? () => setConfirmVisible(true) : undefined}
        submitting={submitting}
      >
        <View>
          <FieldLabel>Titre</FieldLabel>
          <Input value={form.titre} onChangeText={(t) => setForm((f) => ({ ...f, titre: t }))} />
        </View>
        <View>
          <FieldLabel>Lien vidéo YouTube</FieldLabel>
          <Input
            value={form.url}
            onChangeText={(t) => setForm((f) => ({ ...f, url: t }))}
            placeholder="https://www.youtube.com/watch?v=..."
            autoCapitalize="none"
          />
        </View>
        <View>
          <FieldLabel>Date</FieldLabel>
          <Input
            value={form.date.slice(0, 10)}
            onChangeText={(t) => setForm((f) => ({ ...f, date: t }))}
            placeholder="AAAA-MM-JJ"
          />
        </View>
        <CheckboxRow
          label="Mettre en avant sur l’accueil"
          checked={misEnAvant}
          onToggle={() => setMisEnAvant((v) => !v)}
        />
      </FormModal>

      <ConfirmDialog
        visible={confirmVisible}
        title="Supprimer cette publication ?"
        message="Cette action est définitive."
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleDelete}
      />
    </View>
  );
}

function NextCouncilSection({
  isAdmin,
  prochainConseil,
}: {
  isAdmin: boolean;
  prochainConseil: ReturnType<typeof useDocument<ProchainConseil>>;
}) {
  const storedDate = prochainConseil.data.date ? prochainConseil.data.date.slice(0, 10) : '';
  const storedHeure = prochainConseil.data.date ? prochainConseil.data.date.slice(11, 16) : '';

  const [date, setDate] = useState(storedDate);
  const [heure, setHeure] = useState(storedHeure);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDate(storedDate);
    setHeure(storedHeure);
  }, [storedDate, storedHeure]);

  const dirty = date !== storedDate || heure !== storedHeure;
  const announced = !!prochainConseil.data.date;

  const save = async () => {
    setSaving(true);
    try {
      await prochainConseil.save({ date: date && heure ? `${date}T${heure}:00` : '' });
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    setDate('');
    setHeure('');
    await prochainConseil.save({ date: '' });
  };

  return (
    <View>
      {isAdmin && (
        <Card style={{ marginBottom: spacing(3) }}>
          <Text style={styles.liveToggleLabel}>Annoncer le prochain conseil</Text>
          <View style={styles.councilDateRow}>
            <Input
              value={date}
              onChangeText={setDate}
              placeholder="AAAA-MM-JJ"
              style={{ flex: 1 }}
            />
            <Input
              value={heure}
              onChangeText={setHeure}
              placeholder="HH:MM"
              style={{ flex: 1 }}
            />
          </View>
          <View style={styles.councilActionsRow}>
            {dirty && <Button label="Enregistrer" onPress={save} loading={saving} style={{ flex: 1 }} />}
            {announced && !dirty && (
              <Button label="Effacer l'annonce" variant="outline" onPress={clear} style={{ flex: 1 }} />
            )}
          </View>
        </Card>
      )}

      {announced && (
        <Card style={styles.announceCard}>
          <Ionicons name="megaphone-outline" size={22} color={colors.coral} />
          <View style={{ flex: 1 }}>
            <Text style={styles.nextCouncilLabel}>Prochain conseil municipal</Text>
            <Text style={styles.nextCouncilDate}>
              {new Date(prochainConseil.data.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
              {' à '}
              {new Date(prochainConseil.data.date).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </Card>
      )}
    </View>
  );
}

function LiveSection({
  isAdmin,
  liveStatus,
}: {
  isAdmin: boolean;
  liveStatus: ReturnType<typeof useDocument<LiveStatus>>;
}) {
  const [enDirect, setEnDirect] = useState(liveStatus.data.enDirect);
  const [url, setUrl] = useState(liveStatus.data.url);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEnDirect(liveStatus.data.enDirect);
    setUrl(liveStatus.data.url);
  }, [liveStatus.data.enDirect, liveStatus.data.url]);

  const dirty = enDirect !== liveStatus.data.enDirect || url !== liveStatus.data.url;

  const save = async () => {
    setSaving(true);
    try {
      await liveStatus.save({ enDirect, url });
    } finally {
      setSaving(false);
    }
  };

  const isLive = liveStatus.data.enDirect && !!extractYoutubeId(liveStatus.data.url);
  const embedUrl = isLive ? getYoutubeEmbedUrl(liveStatus.data.url) : null;

  return (
    <View>
      {isAdmin && (
        <Card style={{ marginBottom: spacing(4) }}>
          <View style={styles.liveToggleRow}>
            <Text style={styles.liveToggleLabel}>Diffuser un direct</Text>
            <Switch
              value={enDirect}
              onValueChange={setEnDirect}
              trackColor={{ true: colors.coral, false: colors.greyLight }}
              thumbColor={colors.white}
            />
          </View>
          {enDirect && (
            <Input
              value={url}
              onChangeText={setUrl}
              placeholder="Lien YouTube du direct en cours"
              autoCapitalize="none"
              style={{ marginTop: spacing(3) }}
            />
          )}
          {dirty && (
            <Button
              label="Enregistrer"
              onPress={save}
              loading={saving}
              style={{ marginTop: spacing(3) }}
            />
          )}
        </Card>
      )}

      {isLive && embedUrl ? (
        <View>
          <Badge label="EN DIRECT" tone="coral" />
          <View style={styles.playerWrap}>
            {Platform.OS === 'web' ? (
              <WebPlayerFallback url={liveStatus.data.url} />
            ) : (
              <WebView
                source={{ uri: embedUrl }}
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction={false}
              />
            )}
          </View>
        </View>
      ) : (
        <Card>
          <Text style={styles.infoText}>
            Aucun direct en ce moment. Revenez pendant une séance du conseil municipal, ou
            retrouvez les replays ci-dessous.
          </Text>
          <Button
            label="Voir la chaîne YouTube"
            variant="outline"
            icon="logo-youtube"
            onPress={() => WebBrowser.openBrowserAsync(CHANNEL_STREAMS_URL)}
            style={{ marginTop: spacing(4) }}
          />
        </Card>
      )}
    </View>
  );
}

function WebPlayerFallback({ url }: { url: string }) {
  const thumbnail = getYoutubeThumbnail(url);
  return (
    <Pressable
      style={styles.webFallback}
      onPress={() => WebBrowser.openBrowserAsync(url)}
    >
      {thumbnail && <Image source={{ uri: thumbnail }} style={StyleSheet.absoluteFill} />}
      <View style={styles.webFallbackOverlay}>
        <Ionicons name="play-circle" size={48} color={colors.white} />
      </View>
    </Pressable>
  );
}

function PublicationCard({
  publication,
  isAdmin,
  expanded,
  onToggleExpand,
  onEdit,
}: {
  publication: WithId<Publication>;
  isAdmin: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
}) {
  const thumbnail = getYoutubeThumbnail(publication.url);
  const embedUrl = getYoutubeEmbedUrl(publication.url, true);

  return (
    <Card style={{ marginBottom: spacing(3), padding: 0, overflow: 'hidden' }}>
      {expanded && embedUrl ? (
        <View style={styles.playerWrap}>
          {Platform.OS === 'web' ? (
            <WebPlayerFallback url={publication.url} />
          ) : (
            <WebView source={{ uri: embedUrl }} allowsFullscreenVideo mediaPlaybackRequiresUserAction={false} />
          )}
        </View>
      ) : (
        <Pressable onPress={onToggleExpand} style={styles.thumbWrap}>
          {thumbnail && <Image source={{ uri: thumbnail }} style={StyleSheet.absoluteFill} />}
          <View style={styles.thumbOverlay}>
            <Ionicons name="play-circle" size={44} color={colors.white} />
          </View>
        </Pressable>
      )}
      <View style={styles.pubFooter}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pubTitre}>{publication.titre}</Text>
          <Text style={styles.pubDate}>
            {new Date(publication.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
        {isAdmin && <IconButton name="create-outline" onPress={onEdit} />}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing(5), paddingBottom: spacing(16) },
  infoText: { fontFamily: typography.body, fontSize: 13, color: colors.ink, lineHeight: 19 },
  liveToggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveToggleLabel: { fontFamily: typography.bodySemiBold, fontSize: 14, color: colors.ink },
  councilDateRow: { flexDirection: 'row', gap: spacing(3), marginTop: spacing(3) },
  councilActionsRow: { flexDirection: 'row', gap: spacing(3), marginTop: spacing(3) },
  announceCard: {
    marginBottom: spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  nextCouncilLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 11,
    color: colors.grey,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  nextCouncilDate: {
    fontFamily: typography.heading,
    fontSize: 15,
    color: colors.ink,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  playerWrap: {
    marginTop: spacing(2),
    height: 220,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.ink,
  },
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
  },
  webFallbackOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,20,30,0.25)',
  },
  thumbWrap: { height: 170, backgroundColor: colors.ink },
  thumbOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,20,30,0.25)',
  },
  pubFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(4),
  },
  pubTitre: { fontFamily: typography.bodySemiBold, fontSize: 14, color: colors.ink },
  pubDate: { fontFamily: typography.body, fontSize: 11.5, color: colors.grey, marginTop: 2 },
});
