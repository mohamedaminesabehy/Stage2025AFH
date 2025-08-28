import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TimetableComponent } from './pages/timetable/timetable.component';
import { FournisseurComponent } from './parametrage/fournisseur/fournisseur.component';
import { ArticleComponent } from './parametrage/article/article.component';
import { TypeGarantieComponent } from './parametrage/type-garantie/type-garantie.component';
import { TypePenaliteComponent } from './parametrage/type-penalite/type-penalite.component';
import { MarcheComponent } from './pages/marche/marche/marche.component';
import { DecompteComponent } from './pages/decompte/decompte/decompte.component';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { StatistiquesPeriodesComponent } from './pages/statistiques/statistiques-periodes/statistiques-periodes.component';



const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'timetable', component: TimetableComponent },
  { path: 'fournisseur', component: FournisseurComponent},
  { path: 'typegarantie', component: TypeGarantieComponent},
  { path: 'typepenalite', component: TypePenaliteComponent},
  { path: 'article', component: ArticleComponent},
  { path: 'marche', component: MarcheComponent},
  { path: 'decompte', component: DecompteComponent},
  { path: 'chat', component: ChatComponent},
  { path: 'stat', component: StatistiquesPeriodesComponent},
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
