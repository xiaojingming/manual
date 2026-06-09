import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';

interface RemoteMarkdownProps {
  url: string;
}

type Status = 'loading' | 'success' | 'error';

export default function RemoteMarkdown({ url }: RemoteMarkdownProps) {
  const [content, setContent] = useState<string>('');
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const fetchMarkdown = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const text = await response.text();
        if (!cancelled) {
          setContent(text);
          setStatus('success');
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : String(err);
          setErrorMessage(message);
          setStatus('error');
        }
      }
    };

    fetchMarkdown();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (status === 'loading') {
    return (
      <div className="remote-markdown-loading">
        <Translate id="remoteMarkdown.loading">Loading release notes...</Translate>
      </div>
    );
  }

  if (status === 'error') {
    const isNetworkError =
      errorMessage.includes('fetch') ||
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('CORS');

    return (
      <div className="remote-markdown-error" style={{ color: 'var(--ifm-color-danger)' }}>
        <p>
          <Translate id="remoteMarkdown.errorTitle">Failed to load release notes.</Translate>
        </p>
        {isNetworkError ? (
          <p>
            <Translate id="remoteMarkdown.networkError">
              This may be caused by network issues or GitHub being temporarily unreachable.
              You can also view the release notes directly on GitHub.
            </Translate>
          </p>
        ) : (
          <p>
            <Translate id="remoteMarkdown.httpError">
              Server returned an error. Please try again later.
            </Translate>
          </p>
        )}
        <p style={{ fontSize: '0.9em', opacity: 0.8 }}>{errorMessage}</p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Translate id="remoteMarkdown.viewOnGitHub">View on GitHub</Translate>
        </a>
      </div>
    );
  }

  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, title }) => {
            const isExternal =
              typeof href === 'string' &&
              (href.startsWith('http') || href.startsWith('//'));
            if (isExternal) {
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" title={title}>
                  {children}
                </a>
              );
            }
            return (
              <Link to={href} title={title}>
                {children}
              </Link>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
