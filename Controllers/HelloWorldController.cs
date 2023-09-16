using Microsoft.AspNetCore.Mvc;
using myFirstMvc.Models;

namespace myFirstMvc.Controllers
{
  public class HelloWorldController : Controller
  {
    public IActionResult Index()
    {
      DogViewModel doggy = new() 
      { 
        Name="Jade", 
        Age=12 
      };
      return View(doggy);
    }

    public IActionResult Create()
    {
      return View();
    }

    public string Hello()
    {
      return "Who's there?";
    }
  }
}