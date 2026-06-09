import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import RemoteMarkdown from '@site/src/components/RemoteMarkdown';

const BASE_URL = 'https://raw.githubusercontent.com/zgsm-sangfor/manual/refs/heads/main/docs-cli';

export default function CscReleaseNotes() {
  const { i18n } = useDocusaurusContext();
  const changelogPath = i18n.currentLocale === 'zh' ? 'CHANGELOG.zh.md' : 'CHANGELOG.md';
  const url = `${BASE_URL}/${changelogPath}`;
  return <RemoteMarkdown url={url} />;
}
