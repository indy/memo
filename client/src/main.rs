#![recursion_limit = "256"]

mod model;

fn main() {
    yew::start_app::<model::Model>();
}
