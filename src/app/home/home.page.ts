import { Component } from '@angular/core';
// import { IonicSqliteDbVersioningProvider } from 'src/providers/ionic-sqlite-versioning';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    // private ionicSqliteVersioningProvider: IonicSqliteDbVersioningProvider
  ) { }

  public async doSomethingButtonAction() {
    try {
      // await this.ionicSqliteVersioningProvider.upgrade()
    } catch (error) {
      console.error(error)
    }
  }

}
