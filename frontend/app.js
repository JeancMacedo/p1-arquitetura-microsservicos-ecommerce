const API = {
  catalog: "http://localhost:3001",
  user: "http://localhost:3002",
  order: "http://localhost:3003",
  inventory: "http://localhost:3004"
};

function setResult(elementId, data, isError = false) {
  const el = document.getElementById(elementId);
  el.classList.toggle("error", isError);
  el.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(JSON.stringify(payload));
  }

  return payload;
}

document.getElementById("btnLoadProducts").addEventListener("click", async () => {
  try {
    const products = await requestJson(`${API.catalog}/products`);
    const list = document.getElementById("productsList");
    list.innerHTML = "";

    products.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.name} | Marca: ${item.sku.split("-")[0]} | R$ ${item.price} | ID: ${item._id}`;
      li.style.cursor = "pointer";
      li.title = "Clique para preencher Product ID em Estoque e Pedido";
      li.addEventListener("click", () => {
        document.getElementById("stockProductId").value = item._id;
        document.getElementById("orderProductId").value = item._id;
      });
      list.appendChild(li);
    });
  } catch (error) {
    setResult("orderResult", `Falha ao carregar catalogo: ${error.message}`, true);
  }
});

document.getElementById("userForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const name = document.getElementById("userName").value;
    const email = document.getElementById("userEmail").value;

    const user = await requestJson(`${API.user}/users`, {
      method: "POST",
      body: JSON.stringify({ name, email })
    });

    setResult("userResult", { message: "Usuario criado", userId: user._id });
    document.getElementById("orderUserId").value = user._id;
  } catch (error) {
    setResult("userResult", `Erro: ${error.message}`, true);
  }
});

document.getElementById("stockForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const productId = document.getElementById("stockProductId").value;
    const quantity = Number(document.getElementById("stockQuantity").value);

    const stock = await requestJson(`${API.inventory}/inventory`, {
      method: "POST",
      body: JSON.stringify({ productId, quantity })
    });

    setResult("stockResult", { message: "Estoque salvo", stock });
  } catch (error) {
    setResult("stockResult", `Erro: ${error.message}`, true);
  }
});

document.getElementById("orderForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const userId = document.getElementById("orderUserId").value;
    const productId = document.getElementById("orderProductId").value;
    const quantity = Number(document.getElementById("orderQuantity").value);
    const forcePaymentStatus = document.getElementById("forcePaymentStatus").value;

    const body = {
      userId,
      items: [{ productId, quantity }]
    };

    if (forcePaymentStatus) {
      body.forcePaymentStatus = forcePaymentStatus;
    }

    const order = await requestJson(`${API.order}/orders`, {
      method: "POST",
      body: JSON.stringify(body)
    });

    setResult("orderResult", {
      message: "Pedido criado",
      orderId: order._id,
      status: order.status,
      total: order.total
    });
  } catch (error) {
    setResult("orderResult", `Erro: ${error.message}`, true);
  }
});
