import { BrowserModule } from '@angular/platform-browser';
import { NgModule }      from '@angular/core';

import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

const fireabaseConfig = {
  apiKey: "AIzaSyCsuvmR1-QzpNhhCE6dD8tx0g2ZItzJ7p4",
  authDomain: "igisoro2players.firebaseapp.com",
  databaseURL: "https://igisoro2players.firebaseio.com",
  projectId: "igisoro2players",
  storageBucket: "igisoro2players.appspot.com",
  messagingSenderId: "267665473753"
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
