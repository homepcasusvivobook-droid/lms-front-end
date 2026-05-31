import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Books } from './pages/books/books';
import { Members } from './pages/members/members';
import { BookPurchase } from './pages/book-purchase/book-purchase';
import { BookIssue } from './pages/book-issue/book-issue';
import { BookReturn } from './pages/book-return/book-return';
import { Users } from './pages/users/users';
import { Masters } from './pages/masters/masters';
import { BookMaster } from './pages/book-master/book-master';
import { Authors } from './pages/authors/authors';
import { Publishers } from './pages/publishers/publishers';
import { Languages } from './pages/languages/languages';
import { Categories } from './pages/categories/categories';
import { Shelf } from './pages/shelf/shelf';
import { Rack } from './pages/rack/rack';
import { MemberTypes } from './pages/member-types/member-types';

import { authGuard } from './guards/auth-guard';

import { ChangePassword } from './pages/change-password/change-password';

import { Currencies } from './pages/currencies/currencies';

const allRoles = ['Admin', 'Secretary', 'Treasurer', 'Internal Auditor', 'Librarian', 'Assistant Librarian'];

const noTreasurer = ['Admin', 'Secretary', 'Internal Auditor', 'Librarian', 'Assistant Librarian'];

const masterEntryRoles = ['Admin', 'Secretary', 'Librarian', 'Assistant Librarian'];

const usersRoles = ['Admin', 'Secretary'];

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    data: { roles: allRoles }
  },

  {
    path: 'book-purchase',
    component: BookPurchase,
    canActivate: [authGuard],
    data: { roles: allRoles }
  },

  {
    path: 'members',
    component: Members,
    canActivate: [authGuard],
    data: { roles: allRoles }
  },

  {
    path: 'book-issue',
    component: BookIssue,
    canActivate: [authGuard],
    data: { roles: noTreasurer }
  },

  {
    path: 'book-return',
    component: BookReturn,
    canActivate: [authGuard],
    data: { roles: noTreasurer }
  },

  {
    path: 'books',
    component: Books,
    canActivate: [authGuard],
    data: { roles: noTreasurer }
  },

  {
    path: 'masters',
    component: Masters,
    canActivate: [authGuard],
    data: { roles: noTreasurer }
  },

  {
    path: 'book-master',
    component: BookMaster,
    canActivate: [authGuard],
    data: { roles: noTreasurer }
  },

  {
    path: 'authors',
    component: Authors,
    canActivate: [authGuard],
    data: { roles: masterEntryRoles }
  },

  {
    path: 'publishers',
    component: Publishers,
    canActivate: [authGuard],
    data: { roles: masterEntryRoles }
  },

  {
    path: 'languages',
    component: Languages,
    canActivate: [authGuard],
    data: { roles: masterEntryRoles }
  },

  {
    path: 'categories',
    component: Categories,
    canActivate: [authGuard],
    data: { roles: masterEntryRoles }
  },

  {
    path: 'shelf',
    component: Shelf,
    canActivate: [authGuard],
    data: { roles: masterEntryRoles }
  },

  {
    path: 'rack',
    component: Rack,
    canActivate: [authGuard],
    data: { roles: masterEntryRoles }
  },

  {
    path: 'users',
    component: Users,
    canActivate: [authGuard],
    data: { roles: usersRoles }
  },
  {
    path: 'change-password',
    component: ChangePassword,
   canActivate: [authGuard],
   data: { roles: allRoles }
  },
  {
    path: 'member-types',
    component: MemberTypes,
    canActivate: [authGuard],
    data: { roles: masterEntryRoles }
  },
  {
    path: 'currencies',
    component: Currencies,
    canActivate: [authGuard],
    data: { roles: masterEntryRoles }
  },
  { path: '**', 
    redirectTo: 'dashboard' 
  }

];