/*
    BSD 3-Clause License    
    Copyright (c) 2023, Doosan Robotics Inc.
*/
import { BaseModule, ModuleScreen, ModuleScreenProps, System } from 'dart-api';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import DrlUtils from './DrlUtils';
import App from './App';

// IIFE for register a function to create an instance of main class which is inherited BaseModule.
(() => {
  System.registerModuleMainClassCreator(
    (packageInfo) => new Module(packageInfo),
  );
})();
class Module extends BaseModule {
  getModuleScreen(componentId: string) {
    if (componentId === 'MainScreen') {
      return MainScreen;
    }
    return null;
  }
}
class MainScreen extends ModuleScreen {
  constructor(props: ModuleScreenProps) {
    super(props);
  }
  componentWillUnmount() {
    // Must delete DrlUtils Instance to free up memory
    DrlUtils.deleteInstance();
  }
  render() {
    return (
      <ThemeProvider theme={this.systemTheme}>
        <App moduleContext={this.moduleContext} />
      </ThemeProvider>
    );
  }
}
