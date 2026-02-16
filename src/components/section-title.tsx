import React from 'react';

export const SectionTitle = ({ title, subtitle, extraSubtitle, className }: any) => (
  <div className={className}>
    <h1>{title}</h1>
    <p>{subtitle}</p>
    <p>{extraSubtitle}</p>
  </div>
);
