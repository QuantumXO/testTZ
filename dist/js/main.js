(() => {
    function removeActiveClassFromItem(item){
        item.classList.remove('active');
    }

    document.addEventListener('mouseover', (e) => {
        const target  = e.target;

       if(target.classList.contains('main__block__title')){
            target.closest('.main__block').querySelector('.main__block__line').classList.add('active');
       }else {
           [...document.querySelectorAll('.main__block__line')].forEach(item => {
               removeActiveClassFromItem(item);
           })
       }
    });

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