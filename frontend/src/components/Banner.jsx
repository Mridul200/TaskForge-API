import React from 'react';

export default function Banner({ type = 'error', message }) {
  if (!message) return null;
  return <div className={`banner banner-${type}`}>{message}</div>;
}
