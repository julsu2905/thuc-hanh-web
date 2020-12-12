import { createCat } from "./createCat";
import { login, logout } from "./login";
import { createPro } from "./createPro";
import {showAlert} from './alert';
import { get } from "jquery";

//DOM ELEMENT
const formLogin = document.querySelector(".form-login");
const logoutBtn = document.querySelector(".logout");
const formCreateCat = document.querySelector(".form-cat");
const formCreatePro = document.querySelector(".form-pro");
const formSearch = document.querySelector(".form-search");

if (formLogin) {
	formLogin.addEventListener("submit", (e) => {
		e.preventDefault();
		const email = document.querySelector("#email").value;
		const password = document.querySelector("#password").value;
		console.log(email);
		console.log(password);

		login(email, password);
	});
}

if (logoutBtn) {
	console.log("err");
}

if (formCreateCat) {
	formCreateCat.addEventListener("submit", (e) => {
		e.preventDefault();
		const name = $("#catName").val();
		console.log(name);
		createCat(name);
	});
}

if (formCreatePro) {
	formCreatePro.addEventListener("submit", (e) => {
		e.preventDefault();
		const name = $("#name").val();
		const category = $("#category").val();
		const price = $("#price").val();
		const color = $("#color").val();

		createPro(name, category, price, color);
	});
}

if (formSearch) {
	formSearch.addEventListener("submit", (e) => {
		e.preventDefault();
		const value = $("#txtSearch").val();
		$.ajax({
			method: "GET",
			url: "http://127.0.0.1/admin/product",
			data: {
				search: value,
			},
		})
			.then((res) => {
				if (res.data.status === "success") {
					var result = jQuery.parse(res.data);
					$(function () {
						var $tbody = $("#table_content").empty();
						for (var i = 0; i < result.length; i++) {
							$tbody.append('<tr id="' + i + '">');
							$tbody.append("<td>" + result[i].name + "</td>");
							$tbody.append("<td>" + result[i].category.name + "</td>");
							$tbody.append("<td>" + result[i].photo + "</td>");
							$tbody.append("<td>" + result[i].price + "</td>");
							$tbody.append("<td>" + result[i].color + "</td>");
							$tbody.append(
								"<td class='column-verticallineMiddle form-inline'>"
							);
							$tbody.append(
								'<form action="/admin/product/delete/<%= product.id %>" method="POST">'
							);
							$tbody.append(
								'<button type="submit" class="alert-danger"><i class="fas fa-trash"></i></button>'
							);
							$tbody.append("</form></td>");
							$tbody.append("</tr>");
						}
						$("table_content").append($tbody);
					});
				}
			})
			.catch((err) => {
				showAlert("error", err.response.data.message);
			});
	});
}
