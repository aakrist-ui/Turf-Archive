import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import NotificationBell from '../components/NotificationBell';
import { useAuth } from '../context/AuthContext';
import { useChats } from '../context/ChatContext';
import api from '../services/api';

interface Player {
  _id: string;
  name: string;
  email: string;
  position?: string;
  skillLevel?: string;
  currentTeam?: { _id?: string; name?: string } | string | null;
}

interface TeamMember {
  user: Player;
  position: string;
}

interface Team {
  _id: string;
  name: string;
  description?: string;
  maxMembers: number;
  captain: Player;
  members: TeamMember[];
}

const TeamScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { refreshChats, markChatAsRead } = useChats();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState('10');
  const [playerQuery, setPlayerQuery] = useState('');
  const [playerResults, setPlayerResults] = useState<Player[]>([]);

  const isCaptain = useMemo(() => team?.captain?._id === user?.id, [team, user?.id]);

  const loadMyTeam = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/teams/my/team');
      setTeam(response.data.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setTeam(null);
      } else {
        console.log('Error loading team:', error.response?.data || error.message);
        Alert.alert('Unable to load team', 'We could not load your team details right now.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyTeam();
  }, [loadMyTeam]);

  const openTeamChat = async () => {
    if (!team) {
      return;
    }

    try {
      const response = await api.post(`/chats/team/${team._id}`);
      const chat = response.data.data;
      await refreshChats();
      await markChatAsRead(chat._id);
      navigation.navigate('ChatRoom', { chatId: chat._id, recipientName: chat.name || `${team.name} Chat` });
    } catch (error: any) {
      Alert.alert('Unable to open team chat', error.response?.data?.message || 'Please try again.');
    }
  };

  const createTeam = async () => {
    try {
      setSubmitting(true);
      const response = await api.post('/teams', {
        name: name.trim(),
        description: description.trim(),
        maxMembers: Number(maxMembers) || 10,
      });
      setTeam(response.data.data);
      setName('');
      setDescription('');
    } catch (error: any) {
      Alert.alert('Could not create team', error.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const searchPlayers = async (query: string) => {
    setPlayerQuery(query);

    if (!query.trim()) {
      setPlayerResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await api.get('/users', { params: { q: query.trim() } });
      setPlayerResults(response.data.data || []);
    } catch (error: any) {
      console.log('Error searching users:', error.response?.data || error.message);
    } finally {
      setSearching(false);
    }
  };

  const invitePlayer = async (player: Player) => {
    if (!team) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post(`/teams/${team._id}/members`, {
        userId: player._id,
        position: player.position || 'Any',
      });
      setTeam(response.data.data);
      setPlayerQuery('');
      setPlayerResults([]);
    } catch (error: any) {
      Alert.alert('Invite failed', error.response?.data?.message || 'Could not add this player to the team.');
    } finally {
      setSubmitting(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!team) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.delete(`/teams/${team._id}/members/${memberId}`);
      setTeam(response.data.data);
    } catch (error: any) {
      Alert.alert('Could not remove player', error.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const leaveTeam = async () => {
    if (!team) {
      return;
    }

    try {
      setSubmitting(true);
      await api.delete(`/teams/${team._id}/leave`);
      setTeam(null);
    } catch (error: any) {
      Alert.alert('Could not leave team', error.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTeam = async () => {
    if (!team) {
      return;
    }

    try {
      setSubmitting(true);
      await api.delete(`/teams/${team._id}`);
      setTeam(null);
    } catch (error: any) {
      Alert.alert('Could not delete team', error.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team</Text>
        <NotificationBell navigation={navigation} dark />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadMyTeam} tintColor="#F97316" />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        ) : team ? (
          <View style={styles.body}>
            <View style={styles.teamCard}>
              <Text style={styles.teamName}>{team.name}</Text>
              <Text style={styles.teamMeta}>{team.members.length}/{team.maxMembers} players</Text>
              {team.description ? <Text style={styles.teamDescription}>{team.description}</Text> : null}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Squad</Text>
              {team.members.map((member) => (
                <View key={member.user._id} style={styles.memberCard}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {member.user.name}
                      {member.user._id === team.captain._id ? ' • Captain' : ''}
                    </Text>
                    <Text style={styles.memberMeta}>
                      {member.position || member.user.position || 'Any'}
                      {member.user.skillLevel ? ` • ${member.user.skillLevel}` : ''}
                    </Text>
                  </View>
                  {isCaptain && member.user._id !== team.captain._id ? (
                    <TouchableOpacity style={styles.memberAction} onPress={() => removeMember(member.user._id)}>
                      <Text style={styles.memberActionText}>Remove</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
            </View>

            {isCaptain ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Invite Players</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Search players by name or email"
                  placeholderTextColor="#8A949C"
                  value={playerQuery}
                  onChangeText={searchPlayers}
                />
                {searching ? <Text style={styles.helperText}>Searching players...</Text> : null}
                {playerResults.map((player) => (
                  <View key={player._id} style={styles.searchCard}>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{player.name}</Text>
                      <Text style={styles.memberMeta}>
                        {player.position || 'Any'}
                        {player.skillLevel ? ` • ${player.skillLevel}` : ''}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.memberAction, !!player.currentTeam && styles.memberActionDisabled]}
                      onPress={() => invitePlayer(player)}
                      disabled={!!player.currentTeam || submitting}
                    >
                      <Text style={styles.memberActionText}>{player.currentTeam ? 'Busy' : 'Invite'}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={openTeamChat}>
                <Text style={styles.secondaryButtonText}>Open Team Chat</Text>
              </TouchableOpacity>

              {isCaptain ? (
                <TouchableOpacity style={styles.dangerButton} onPress={deleteTeam}>
                  <Text style={styles.dangerButtonText}>{submitting ? 'Working...' : 'Delete Team'}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.dangerButton} onPress={leaveTeam}>
                  <Text style={styles.dangerButtonText}>{submitting ? 'Working...' : 'Leave Team'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.body}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Create your team</Text>
              <Text style={styles.emptyText}>Set up a squad, invite players, and keep match planning in one place.</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Team Details</Text>
              <TextInput
                style={styles.input}
                placeholder="Team name"
                placeholderTextColor="#8A949C"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Short team description"
                placeholderTextColor="#8A949C"
                value={description}
                onChangeText={setDescription}
                multiline
              />
              <TextInput
                style={styles.input}
                placeholder="Max members"
                placeholderTextColor="#8A949C"
                value={maxMembers}
                onChangeText={setMaxMembers}
                keyboardType="number-pad"
              />
              <TouchableOpacity style={styles.primaryButton} onPress={createTeam} disabled={submitting}>
                <Text style={styles.primaryButtonText}>{submitting ? 'Creating...' : 'Create Team'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F1E8' },
  header: {
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#12212B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { backgroundColor: '#243744', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  backText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  content: { flex: 1 },
  loadingContainer: { paddingVertical: 80, alignItems: 'center' },
  body: { padding: 20 },
  teamCard: { backgroundColor: '#12212B', borderRadius: 24, padding: 18 },
  teamName: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  teamMeta: { color: '#F3C574', fontSize: 14, fontWeight: '700', marginTop: 8 },
  teamDescription: { color: '#D6DEE5', fontSize: 14, lineHeight: 20, marginTop: 10 },
  section: { marginTop: 24 },
  sectionTitle: { color: '#12212B', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6DCC8',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  memberInfo: { flex: 1 },
  memberName: { color: '#12212B', fontSize: 16, fontWeight: '800' },
  memberMeta: { color: '#5F6B74', fontSize: 13, marginTop: 4 },
  memberAction: { backgroundColor: '#12212B', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  memberActionDisabled: { opacity: 0.45 },
  memberActionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6DCC8',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#12212B',
    fontSize: 15,
    marginBottom: 12,
  },
  textArea: { minHeight: 96, textAlignVertical: 'top' },
  primaryButton: { backgroundColor: '#F97316', borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#E6DCC8', padding: 20 },
  emptyTitle: { color: '#12212B', fontSize: 24, fontWeight: '800' },
  emptyText: { marginTop: 8, color: '#5F6B74', fontSize: 14, lineHeight: 21 },
  helperText: { color: '#69747D', fontSize: 13, marginBottom: 10 },
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6DCC8',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  actionRow: { marginTop: 24, gap: 12 },
  secondaryButton: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E6DCC8', paddingVertical: 15, alignItems: 'center' },
  secondaryButtonText: { color: '#12212B', fontSize: 15, fontWeight: '800' },
  dangerButton: { backgroundColor: '#7F1D1D', borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  dangerButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  bottomSpacer: { height: 90 },
});

export default TeamScreen;
