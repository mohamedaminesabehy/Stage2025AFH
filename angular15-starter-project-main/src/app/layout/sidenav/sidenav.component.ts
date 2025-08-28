import { Component, OnInit } from '@angular/core';
import { SidebarService } from 'src/app/services/sidebar/sidebar.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/User/user.service';

type SubmenuKeys = 'parametrage' | 'fournisseur' | 'typepenalite' | 'typegarantie' | 'article' | 'statistique';


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [
        animate(300, style({ opacity: 1 })),
      ]),
    ]),
  ],

})
export class SidebarComponent implements OnInit {

  matricule!: number;
  numStruct!: number;
  isAuthenticated = false;
  isSidebarVisible = true;
  isSubmenuOpen: { [key in SubmenuKeys]: boolean } = {
    parametrage: false,
    fournisseur: false,
    typepenalite: false,
    typegarantie: false,
    article: false,
    statistique: false // Ajout pour Statistique
  };
  adminHasAccess = false;
  NUM_STRUCT_DEPT_INFO: string =  '03';


  constructor(private sidebarService: SidebarService,private authService: AuthService, private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    const matriculeFromStorage = this.authService.isLoggedIn();
    const numStructFromStorage = this.authService.getNumStruct();
    this.matricule = matriculeFromStorage ? parseInt(matriculeFromStorage, 10) : NaN;
    this.numStruct = numStructFromStorage ? parseInt(numStructFromStorage, 10) : NaN;

    console.log(this.matricule)
    if (this.numStruct === parseInt(this.NUM_STRUCT_DEPT_INFO)) {
      this.adminHasAccess = true;
    } else {
      this.adminHasAccess = false;
    }
        this.sidebarService.sidebarVisibility$.subscribe((isVisible) => {
      console.log(isVisible)
      this.isSidebarVisible = isVisible;
    });
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    this.sidebarService.toggleSidebar(); // Toggle sidebar state
  }


  toggleSubmenu(menu: SubmenuKeys) {
    this.isSubmenuOpen[menu] = !this.isSubmenuOpen[menu];
  }

  logout(): void {
    this.authService.logout(); // Appel à un service d'authentification
    this.isAuthenticated = false;
  }

  getUserDetails(): void {
    this.userService.getUserById(this.matricule).subscribe(
      (user) => {
        // Une fois les détails de l'utilisateur récupérés, vous pouvez naviguer vers le profil
        console.log('User details:', user);
        this.router.navigate(['/profile'], { queryParams: { matricule: this.matricule }});  // Redirection vers la page de profil
      },
      (error) => {
        console.error('Error fetching user details:', error);
        // Gérer les erreurs si nécessaire
      }
    );
  }


}
