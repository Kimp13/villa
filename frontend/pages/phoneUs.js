import React from "react";

export async function getStaticProps() {
  return {
    props: {
      title: 'Позвонить нам',
      footerEnabled: true
    }
  }
}

export default () => (
  <main className="main" style={{
    background: '#2832c2'
  }}
  >
    <h1 className="header" style={{
      padding: '1rem',
      color: 'white',
      textAlign: 'center'
    }}
    >
      Все телефоны написаны снизу. Не стесняйтесь, звоните :)
    </h1>    
  </main>
);
