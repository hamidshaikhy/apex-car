import { Fragment } from 'react';
export default function RichText({ text }: { text: string }) {
  const pieces = text.split(/([A-Za-z0-9][A-Za-z0-9 .,+:;()/%°’'–−-]*[A-Za-z0-9%°)]|[A-Za-z0-9])/g);
  return (
    <>
      {pieces.map((piece, i) =>
        /[A-Za-z0-9]/.test(piece) ? (
          <bdi dir="ltr" key={i}>
            {piece}
          </bdi>
        ) : (
          <Fragment key={i}>{piece}</Fragment>
        ),
      )}
    </>
  );
}
