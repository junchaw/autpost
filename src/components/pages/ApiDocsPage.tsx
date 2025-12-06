import { RedocStandalone } from 'redoc';

export function ApiDocsPage() {
  return (
    <RedocStandalone
      specUrl="/openapi.yaml"
      options={{
        theme: {
          colors: {
            primary: {
              main: '#6366f1',
            },
          },
          typography: {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            headings: {
              fontFamily: 'system-ui, -apple-system, sans-serif',
            },
          },
        },
        hideDownloadButton: false,
        expandResponses: '200,201',
      }}
    />
  );
}
