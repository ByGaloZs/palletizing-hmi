/*
    BSD 3-Clause License    
    Copyright (c) 2023, Doosan Robotics Inc.
*/
import { ModuleContext } from 'dart-api';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './assets/styles/styles.module.scss';

interface IAppProps {
  moduleContext: ModuleContext;
}

function App(props: IAppProps) {
  const { moduleContext } = props;
  const { t } = useTranslation(moduleContext.packageName);
  return (
    <div className={styles['container-sample']}>
      <div className={styles['label-sample']}>{t('welcome')}</div>
    </div>
  );
}

export default App;
