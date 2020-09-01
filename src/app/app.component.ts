import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DatabaseConnectionService } from 'src/services/database/connection';
import { IonicSqliteDbVersioningProvider } from 'src/providers/ionic-sqlite-versioning';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private dbConnection: DatabaseConnectionService,
    private ionicSqliteVersioningProvider: IonicSqliteDbVersioningProvider
  ) {
    this.initializeApp();
  }

  private async initializeApp() {
    try {
      await this.platform.ready()

      this.statusBar.styleDefault();
      this.splashScreen.hide();

      await this.dbConnection.initialize()

      await this.ionicSqliteVersioningProvider.upgrade()
    } catch (error) {
      console.error(error)
    }
  }
}
