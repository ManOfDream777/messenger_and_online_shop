from django.db import models


class PizzaCategory(models.Model):
    name = models.CharField(max_length=100, verbose_name="Name")

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Sizes(models.Model):
    sizes = {
        'S': 'Small',
        'M': 'Medium',
        'L': 'Large',
        'XL': 'Extra large',
    }

    size = models.CharField(choices=sizes, max_length=20, verbose_name='Size of the pizza')
    price = models.FloatField(default=0, verbose_name='Price')

    class Meta:
        verbose_name = 'Size'
        verbose_name_plural = 'Sizes'

    def __str__(self):
        return f"{self.size} costs {self.price}"


class Pizza(models.Model):
    name = models.CharField(max_length=100, verbose_name="Name")
    description = models.TextField(verbose_name="Description")
    available_sizes = models.ManyToManyField(Sizes, verbose_name="Available sizes")
    minimum_price = models.FloatField(verbose_name="Minimum price", default=0)
    category = models.ForeignKey(PizzaCategory, on_delete=models.CASCADE, verbose_name="Category")

    class Meta:
        verbose_name = "Pizza"
        verbose_name_plural = "Pizzas"

    def __str__(self):
        return self.name


class Additives(models.Model):
    name = models.CharField(max_length=100, verbose_name="Name")
    price = models.FloatField(verbose_name="Price", default=0)

    class Meta:
        verbose_name = "Additive"
        verbose_name_plural = "Additives"

    def __str__(self):
        return self.name


class Order(models.Model):
    pizzas = models.ManyToManyField(Pizza, verbose_name="Pizzas")
    total_price = models.FloatField(verbose_name="Total price", default=0)
    is_paid = models.BooleanField(verbose_name="Is paid", default=False)
    when_created = models.DateTimeField(auto_now_add=True, verbose_name="When created")
    buyer = models.ForeignKey("custom_authentication.MyUser", on_delete=models.CASCADE, verbose_name="Buyer",
                              related_name='order_buyer')
    address_for_delivery = models.TextField(verbose_name="Address for delivery")

    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"

    def __str__(self):
        return f'Order #{self.id} of {self.buyer}'
