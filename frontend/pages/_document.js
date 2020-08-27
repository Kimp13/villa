import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Html>
        <Head>
          <script
            data-ad-client="ca-pub-9036577259588469"
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
          />
        </Head>
        <body className="body">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}