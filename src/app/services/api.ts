import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Api {

  // baseUrl = 'https://localhost:7126/api';
  //baseUrl = 'https://lmsapi20260528173411-afckbkftd0bsfzee.westeurope-01.azurewebsites.net/api';
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // =========================
  // LOGIN
  // =========================

  login(data: any): Observable<any> {

    return this.http.post(
      `${this.baseUrl}/Auth/login`,
      data
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  getDashboard(): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/Dashboard`
    );
  }

  // =========================
  // USERS
  // =========================

  getUsers(): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/Users`
    );
  }

  createUser(data: any): Observable<any> {

    return this.http.post(
      `${this.baseUrl}/Users`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  updateUser(id: number, data: any): Observable<any> {

    return this.http.put(
      `${this.baseUrl}/Users/${id}`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  deleteUser(id: number, deletedBy: string): Observable<any> {

    return this.http.delete(
      `${this.baseUrl}/Users/${id}?deletedBy=${deletedBy}`,
      { responseType: 'text' as 'json' }
    );
  }

  resetPassword(id: number, newPassword: string): Observable<any> {

    return this.http.post(
      `${this.baseUrl}/Users/reset-password/${id}?newPassword=${newPassword}`,
      {},
      { responseType: 'text' as 'json' }
    );
  }

  changePassword(data: any): Observable<any> {

    return this.http.post(
      `${this.baseUrl}/Users/change-password`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  // =========================
  // USER TYPES
  // =========================

  getUserTypes(): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/UserTypes`
    );
  }

  // =========================
  // MEMBERS
  // =========================

  getMembers(): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/Members`
    );
  }

  createMember(data: any): Observable<any> {

    return this.http.post(
      `${this.baseUrl}/Members`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  updateMember(id: number, data: any): Observable<any> {

    return this.http.put(
      `${this.baseUrl}/Members/${id}`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  deleteMember(id: number, deletedBy: string): Observable<any> {

    return this.http.delete(
      `${this.baseUrl}/Members/${id}?deletedBy=${deletedBy}`,
      { responseType: 'text' as 'json' }
    );
  }

  // =========================
  // BOOKS
  // =========================

  getBooks(): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/Books`
    );
  }

  createBook(data: any): Observable<any> {

    return this.http.post(
      `${this.baseUrl}/Books`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  updateBook(id: number, data: any): Observable<any> {

    return this.http.put(
      `${this.baseUrl}/Books/${id}`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  deleteBook(id: number, deletedBy: string): Observable<any> {

    return this.http.delete(
      `${this.baseUrl}/Books/${id}?deletedBy=${deletedBy}`,
      { responseType: 'text' as 'json' }
    );
  }

  // =========================
  // AUTHORS
  // =========================

  getAuthors(): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/Authors`
    );
  }

  createAuthor(data: any): Observable<any> {

    return this.http.post(
      `${this.baseUrl}/Authors`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  updateAuthor(id: number, data: any): Observable<any> {

    return this.http.put(
      `${this.baseUrl}/Authors/${id}`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  deleteAuthor(id: number, deletedBy: string): Observable<any> {

    return this.http.delete(
      `${this.baseUrl}/Authors/${id}?deletedBy=${deletedBy}`,
      { responseType: 'text' as 'json' }
    );
  }

  // =========================
  // PUBLISHERS
  // =========================

  getPublishers(): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/Publishers`
    );
  }

  createPublisher(data: any): Observable<any> {

    return this.http.post(
      `${this.baseUrl}/Publishers`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  updatePublisher(id: number, data: any): Observable<any> {

    return this.http.put(
      `${this.baseUrl}/Publishers/${id}`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  deletePublisher(id: number, deletedBy: string = 'Admin'): Observable<any> { 

    return this.http.delete(
      `${this.baseUrl}/Publishers/${id}?deletedBy=${deletedBy}`,
      { responseType: 'text' as 'json' }
    );
  }

  // =========================
  // LANGUAGES
  // =========================

  getLanguages(): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/Languages`
    );
  }

  createLanguage(data: any): Observable<any> {

    return this.http.post(
      `${this.baseUrl}/Languages`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  updateLanguage(id: number, data: any): Observable<any> {

    return this.http.put(
      `${this.baseUrl}/Languages/${id}`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  deleteLanguage(id: number, deletedBy: string = 'Admin'): Observable<any> {

    return this.http.delete(
      `${this.baseUrl}/Languages/${id}?deletedBy=${deletedBy}`,
      { responseType: 'text' as 'json' }
    );
  }

  // =========================
  // CATEGORIES
  // =========================

  getCategories(): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/Categories`
    );
  }

  createCategory(data: any): Observable<any> {

    return this.http.post(
      `${this.baseUrl}/Categories`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  updateCategory(id: number, data: any): Observable<any> {

    return this.http.put(
      `${this.baseUrl}/Categories/${id}`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  deleteCategory(id: number, deletedBy: string = 'Admin'): Observable<any> {

    return this.http.delete(
      `${this.baseUrl}/Categories/${id}?deletedBy=${deletedBy}`,
      { responseType: 'text' as 'json' }
    );
  }

  // =========================
  // SHELF
  // =========================

  getShelf(): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/Shelf`
    );
  }

  createShelf(data: any): Observable<any> {

    return this.http.post(
      `${this.baseUrl}/Shelf`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  updateShelf(id: number, data: any): Observable<any> {

    return this.http.put(
      `${this.baseUrl}/Shelf/${id}`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  deleteShelf(id: number, deletedBy: string = 'Admin'): Observable<any> {

    return this.http.delete(
      `${this.baseUrl}/Shelf/${id}?deletedBy=${deletedBy}`,
      { responseType: 'text' as 'json' }
    );
  }

  // =========================
  // RACK
  // =========================

  getRack(): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/Rack`
    );
  }

  createRack(data: any): Observable<any> {

    return this.http.post(
      `${this.baseUrl}/Rack`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  updateRack(id: number, data: any): Observable<any> {

    return this.http.put(
      `${this.baseUrl}/Rack/${id}`,
      data,
      { responseType: 'text' as 'json' }
    );
  }

  deleteRack(id: number, deletedBy: string = 'Admin'): Observable<any> {

    return this.http.delete(
      `${this.baseUrl}/Rack/${id}?deletedBy=${deletedBy}`,
      { responseType: 'text' as 'json' }
    );
  }

  // =========================
  // BOOK PURCHASE
  // =========================

  getBookPurchases(): Observable<any> {
  return this.http.get(`${this.baseUrl}/BookPurchases`);
}

getBookPurchaseById(id: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/BookPurchases/${id}`);
}
  
  // =========================
  // BOOK ISSUE
  // =========================

  getBookIssues(): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/BookIssue`
    );
  }
  getLibraryTransactions(): Observable<any> {
  return this.http.get(
    `${this.baseUrl}/LibraryTransactions/issue`
  );
}
  issueBook(data: any): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/LibraryTransactions/issue`,
    data
  );
}
// =========================
// MISSING OLD METHOD NAMES - COMPATIBILITY
// =========================

getDashboardSummary(): Observable<any> {
  return this.http.get(`${this.baseUrl}/Dashboard/summary`);
}

saveBook(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/Books`, data);
}

bulkImportBooks(data: any[]): Observable<any> {
  return this.http.post(`${this.baseUrl}/Books/bulk-import`, data);
}

getShelves(): Observable<any> {
  return this.http.get(`${this.baseUrl}/Shelves`);
}

getRacks(): Observable<any> {
  return this.http.get(`${this.baseUrl}/Racks`);
}

saveBookPurchase(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/BookPurchases`, data);
}

updateBookPurchase(id: number, data: any): Observable<any> {
  return this.http.put(`${this.baseUrl}/BookPurchases/${id}`, data);
}

deleteBookPurchase(id: number, deletedBy: string = 'Admin'): Observable<any> {
  return this.http.delete(
    `${this.baseUrl}/BookPurchases/${id}?deletedBy=${deletedBy}`,
    { responseType: 'text' as 'json' }
  );
}
  
saveMember(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/Members`, data);
}

renewMembership(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/Members/renewal`, data);
}
getMemberTypes(): Observable<any> {
  return this.http.get(`${this.baseUrl}/MemberTypes`);
}

addMemberType(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/MemberTypes`, data);
}

updateMemberType(id: number, data: any): Observable<any> {
  return this.http.put(`${this.baseUrl}/MemberTypes/${id}`, data);
}

deleteMemberType(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/MemberTypes/${id}`);
}
}