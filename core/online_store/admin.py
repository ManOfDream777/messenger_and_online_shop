from django.contrib import admin
from .models import PizzaCategory, Pizza, Order, Additives


@admin.register(PizzaCategory)
class PizzaCategoryAdmin(admin.ModelAdmin):
    pass


@admin.register(Pizza)
class PizzaAdmin(admin.ModelAdmin):
    pass


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    pass


@admin.register(Additives)
class AdditivesAdmin(admin.ModelAdmin):
    pass
