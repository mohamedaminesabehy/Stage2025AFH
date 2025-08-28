import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/User/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any;
  matricule!: number;

  constructor(private route: ActivatedRoute, private userService: UserService,  private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.matricule = +params['matricule']; 
      if (this.matricule) {
        // Faire un appel API pour récupérer les détails de l'utilisateur
        this.userService.getUserById(this.matricule).subscribe((user) => {
          this.user = user;
          console.log(this.user)
        });
      }
    });


  }
  
  retourHome() {
    this.router.navigate(['/home']);
  }

}
