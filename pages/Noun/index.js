import classes from './Noun.module.css';
import React from 'react';
//import loadingNoun from '/loading-skull-noun.gif';

// export const LoadingNoun = () => {
//   return <img  src={loadingNoun} alt={'loading noun'} />;
// };

const Noun = ({loadingNoun}) => {
  return <img  src={loadingNoun}  />;
};

export default Noun;
