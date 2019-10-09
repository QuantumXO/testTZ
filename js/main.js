(() => {
    function removeActiveClassFromItem(item){
        item.classList.remove('active');
    }

    document.addEventListener('click', (e) => {
        const target  = e.target;
        const itemsOfTabsList = document.querySelectorAll('.main__tab__item');
        const content = document.querySelectorAll('.main__tab__content');
        let IdOfActiveItem;

            if(target.classList.contains('main__tab__item')){

            IdOfActiveItem = target.id.slice(-1, );

            [...itemsOfTabsList].forEach(item => {
                removeActiveClassFromItem(item);
            });

            target.classList.add('active');

            [...content].forEach(item => {
                removeActiveClassFromItem(item);
            });
            document.querySelector(`[data-content="${IdOfActiveItem}"]`).classList.add('active');
        }
    })
})();