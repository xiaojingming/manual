import RemoteMarkdown from '@site/src/components/RemoteMarkdown';

// TODO: Replace with the actual GitHub raw URL for CSC release notes
const CSC_RELEASE_NOTES_URL = 'https://raw.githubusercontent.com/USER/REPO/BRANCH/CHANGELOG.md';

export default function CscReleaseNotes() {
  return <RemoteMarkdown url={CSC_RELEASE_NOTES_URL} />;
}
