import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Loader2, MessagesSquare, RefreshCw } from 'lucide-react';
import { isSyncingError, type ChatType } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useSessionsQuery, useSessionChatsQuery } from '../hooks/queries';
import { PageHeader } from '../components/PageHeader';
import './Conversations.css';

const TYPE_FILTERS: (ChatType | 'all')[] = ['all', 'individual', 'group', 'community', 'channel'];
const TYPE_LEGEND: ChatType[] = ['individual', 'group', 'community', 'channel'];

export function Conversations() {
  const { t } = useTranslation();
  useDocumentTitle(t('conversations.title'));

  const { data: sessions = [], isLoading: sessionsLoading } = useSessionsQuery();
  const [sessionId, setSessionId] = useState('');
  const [typeFilter, setTypeFilter] = useState<ChatType | 'all'>('all');
  const [copied, setCopied] = useState<string | null>(null);

  // Default to the first ready session (fall back to first session) once loaded.
  useEffect(() => {
    if (sessionId || sessions.length === 0) return;
    const ready = sessions.find(s => s.status === 'ready');
    setSessionId(ready?.id ?? sessions[0].id);
  }, [sessions, sessionId]);

  const {
    data: chats = [],
    isLoading: chatsLoading,
    isError,
    error,
    failureReason,
    refetch,
  } = useSessionChatsQuery(sessionId, typeFilter === 'all' ? undefined : typeFilter, !!sessionId);

  // True while the backend is still reporting "syncing" — either mid-retry
  // (failureReason set, query still pending) or after retries were exhausted.
  const syncing = isSyncingError(error) || isSyncingError(failureReason);

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  // The number of table columns, so full-width state rows can span correctly.
  const renderBody = () => {
    if (!sessionId) {
      return (
        <div className="empty-table-state">
          <MessagesSquare size={48} strokeWidth={1} />
          <h3>{t('conversations.empty.noSession')}</h3>
        </div>
      );
    }
    if (chatsLoading) {
      return (
        <div className="empty-table-state">
          <Loader2 className="animate-spin" size={32} />
          {syncing && <p>{t('conversations.syncing.description')}</p>}
        </div>
      );
    }
    if (isError) {
      return (
        <div className="empty-table-state">
          <MessagesSquare size={48} strokeWidth={1} />
          <h3>{syncing ? t('conversations.syncing.title') : t('conversations.empty.error')}</h3>
          <p>{syncing ? t('conversations.syncing.description') : (error as Error)?.message}</p>
          <button className="btn-secondary" onClick={() => void refetch()}>
            <RefreshCw size={16} /> {t('conversations.retry')}
          </button>
        </div>
      );
    }
    if (chats.length === 0) {
      return (
        <div className="empty-table-state">
          <MessagesSquare size={48} strokeWidth={1} />
          <h3>{t('conversations.empty.title')}</h3>
          <p>{t('conversations.empty.description')}</p>
        </div>
      );
    }
    return chats.map(chat => (
      <div key={chat.id} className="table-row">
        <span className="name-cell">{chat.name || t('conversations.unnamed')}</span>
        <span>
          <span className={`type-badge type-${chat.type}`}>{t(`conversations.types.${chat.type}`)}</span>
        </span>
        <span className="id-cell">
          <code>{chat.id}</code>
          <button className="icon-btn" title={t('conversations.copyId')} onClick={() => copyToClipboard(chat.id)}>
            {copied === chat.id ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </span>
        <span className="num-cell">{chat.participantsCount ?? '—'}</span>
        <span className="num-cell">{chat.unreadCount ?? 0}</span>
      </div>
    ));
  };

  return (
    <div className="conversations-page">
      <PageHeader
        title={t('conversations.title')}
        subtitle={t('conversations.subtitle')}
        actions={
          <label className="conv-session-select">
            <select value={sessionId} onChange={e => setSessionId(e.target.value)} disabled={sessionsLoading}>
              {sessions.length === 0 && <option value="">{t('conversations.noSessions')}</option>}
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.status !== 'ready' ? ` (${s.status})` : ''}
                </option>
              ))}
            </select>
          </label>
        }
      />

      <div className="conv-filters">
        {TYPE_FILTERS.map(f => (
          <button
            key={f}
            className={`filter-chip ${typeFilter === f ? 'active' : ''}`}
            onClick={() => setTypeFilter(f)}
          >
            {t(`conversations.types.${f}`)}
          </button>
        ))}
      </div>

      <div className="conversations-content">
        <div className="conv-table-container">
          <div className="conv-table">
            <div className="table-row header">
              <span>{t('conversations.columns.name')}</span>
              <span>{t('conversations.columns.type')}</span>
              <span>{t('conversations.columns.id')}</span>
              <span>{t('conversations.columns.participants')}</span>
              <span>{t('conversations.columns.unread')}</span>
            </div>
            {renderBody()}
          </div>
        </div>

        <div className="conv-legend">
          <h3>{t('conversations.columns.type')}</h3>
          <div className="conv-legend-list">
            {TYPE_LEGEND.map(type => (
              <div key={type} className="conv-legend-item">
                <span className={`type-badge type-${type}`}>{t(`conversations.types.${type}`)}</span>
                <span>{t(`conversations.typeDescriptions.${type}`)}</span>
              </div>
            ))}
          </div>
          <p className="conv-note">{t('conversations.communityNote')}</p>
        </div>
      </div>
    </div>
  );
}
