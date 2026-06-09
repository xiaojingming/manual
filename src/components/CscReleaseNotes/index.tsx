import RemoteMarkdown from '@site/src/components/RemoteMarkdown';

const CSC_RELEASE_NOTES_URL = 'https://raw.githubusercontent.com/zgsm-sangfor/manual/refs/heads/main/docs-cli/CHANGELOG.md';

export default function CscReleaseNotes() {
  return <RemoteMarkdown url={CSC_RELEASE_NOTES_URL} />;
}
